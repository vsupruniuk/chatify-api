import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { io, Socket } from 'socket.io-client';
import * as supertest from 'supertest';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { DirectChat, DirectChatMessage, User } from '@entities';

import { users, directChats, directChatsMessages } from '@testMocks';

import { Header, WSEvent, ResponseStatus, Route } from '@enums';

import {
	SuccessfulResponseResult,
	SuccessfulWSResponseResult,
} from '@responses/successfulResponses';
import { ErrorWSResponseResult } from '@responses/errorResponses';
import { WSResponseResult } from '@responses';
import { ErrorField } from '@responses/errors';

import { LoginResponseDto } from '@dtos/auth/login';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

describe('Send message', (): void => {
	let app: INestApplication;
	let postgresContainer: StartedTestContainer;
	let dataSource: DataSource;

	beforeAll(async (): Promise<void> => {
		postgresContainer = await TestDatabaseHelper.initDbContainer();
		dataSource = await TestDatabaseHelper.initDataSource(postgresContainer);

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(DataSource)
			.useValue(dataSource)
			.compile();

		app = moduleFixture.createNestApplication();

		app.useGlobalPipes(new ValidationPipe(validationPipeConfig));
		app.useGlobalFilters(new GlobalExceptionFilter());

		await app.listen(Number(process.env.PORT));
	});

	afterAll(async (): Promise<void> => {
		await dataSource.destroy();
		await postgresContainer.stop();
		await app.close();
	});

	describe('Send message event', (): void => {
		let senderSocket: Socket;
		let receiverSocket: Socket;

		const passwordMock: string = 'Qwerty12345!';
		const senderUser: User = users[1];
		const receiverUser: User = users[2];

		const directChat: DirectChat = directChats[2];
		const chatMessage: DirectChatMessage = directChatsMessages[2];

		const signup = async (user: User): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post(`/${Route.AUTH}/${Route.SIGNUP}`).send({
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				nickname: user.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});
		};

		const createSocket = async (user: User): Promise<Socket> => {
			const loginResponse: supertest.Response = await supertest
				.agent(app.getHttpServer()) //
				.post(`/${Route.AUTH}/${Route.LOGIN}`)
				.send({ email: user.email, password: passwordMock });

			return io(await app.getUrl(), {
				transports: ['websocket'],
				autoConnect: false,
				extraHeaders: {
					[Header.AUTHORIZATION]: `Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			});
		};

		beforeEach(async (): Promise<void> => {
			await signup(senderUser);
			await signup(receiverUser);

			const sender: User | null = await dataSource
				.getRepository(User)
				.findOne({ where: { email: senderUser.email } });
			const receiver: User | null = await dataSource
				.getRepository(User)
				.findOne({ where: { email: receiverUser.email } });

			const chat: DirectChat = dataSource
				.getRepository(DirectChat)
				.create({ ...directChat, users: [sender, receiver] as User[] });

			await dataSource.getRepository(DirectChat).save([chat]);
		});

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);

			if (senderSocket?.connected) {
				senderSocket.disconnect();
			}

			if (receiverSocket?.connected) {
				receiverSocket.disconnect();
			}
		});

		it('should reject connection if user does not provided authorization header', async (): Promise<void> => {
			senderSocket = io(await app.getUrl(), { transports: ['websocket'], autoConnect: false });

			senderSocket.connect();

			await new Promise<void>((resolve, reject) => {
				senderSocket.on('connect', (): void => {
					reject(new Error('Unauthorized socket connected'));
				});

				senderSocket.on('connect_error', (error: Error) => {
					expect(error.message).toBe('Please, login to perform this action');
					resolve();
				});
			});
		});

		it('should reject connection if user provided empty authorization header', async (): Promise<void> => {
			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				autoConnect: false,
				extraHeaders: { [Header.AUTHORIZATION]: '' },
			});

			senderSocket.connect();

			await new Promise<void>((resolve, reject) => {
				senderSocket.on('connect', (): void => {
					reject(new Error('Unauthorized socket connected'));
				});

				senderSocket.on('connect_error', (error: Error) => {
					expect(error.message).toBe('Please, login to perform this action');
					resolve();
				});
			});
		});

		it('should reject connection if user provided authorization header without access token', async (): Promise<void> => {
			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				autoConnect: false,
				extraHeaders: { [Header.AUTHORIZATION]: 'Bearer ' },
			});

			senderSocket.connect();

			await new Promise<void>((resolve, reject) => {
				senderSocket.on('connect', (): void => {
					reject(new Error('Unauthorized socket connected'));
				});

				senderSocket.on('connect_error', (error: Error) => {
					expect(error.message).toBe('Please, login to perform this action');
					resolve();
				});
			});
		});

		it('should reject connection if user provided authorization header with invalid access token', async (): Promise<void> => {
			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				autoConnect: false,
				extraHeaders: { [Header.AUTHORIZATION]: 'Bearer invalidAccessToken' },
			});

			senderSocket.connect();

			await new Promise<void>((resolve, reject) => {
				senderSocket.on('connect', (): void => {
					reject(new Error('Unauthorized socket connected'));
				});

				senderSocket.on('connect_error', (error: Error) => {
					expect(error.message).toBe('Please, login to perform this action');
					resolve();
				});
			});
		});

		it('should emit error event if direct chat id is not valid uuid', async (): Promise<void> => {
			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_MESSAGE, {
				directChatId: '123',
				messageText: chatMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_RECEIVE_MESSAGE, () => {
					reject(new Error('Message with invalid direct chat id was created'));
				});

				senderSocket.on(WSEvent.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'Wrong directChatId format. UUID is expected',
					);
					resolve();
				});
			});
		});

		it('should emit error event if message text is not a string', async (): Promise<void> => {
			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_MESSAGE, {
				directChatId: directChat.id,
				messageText: 555,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_RECEIVE_MESSAGE, () => {
					reject(new Error('Message with non string message was created'));
				});

				senderSocket.on(WSEvent.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'messageText must be a string',
					);
					resolve();
				});
			});
		});

		it('should emit error event if message text is empty string', async (): Promise<void> => {
			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_MESSAGE, {
				directChatId: directChat.id,
				messageText: '',
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_RECEIVE_MESSAGE, () => {
					reject(new Error('Message with empty message was created'));
				});

				senderSocket.on(WSEvent.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'messageText must be at least 1 characters long',
					);
					resolve();
				});
			});
		});

		it('should emit error event if message text is more than 500 characters long', async (): Promise<void> => {
			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_MESSAGE, {
				directChatId: directChat.id,
				messageText: 'Hello'.padEnd(501, 'o'),
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_RECEIVE_MESSAGE, () => {
					reject(new Error('Message with too long message was created'));
				});

				senderSocket.on(WSEvent.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'messageText can be 500 characters long maximum',
					);
					resolve();
				});
			});
		});

		it('should emit error event if direct chat does not exist', async (): Promise<void> => {
			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_MESSAGE, {
				directChatId: '5be24a59-5855-443e-aa7b-ad02207376cd',
				messageText: chatMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_RECEIVE_MESSAGE, () => {
					reject(new Error('Message with not existing direct chat was created'));
				});

				senderSocket.on(WSEvent.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'Direct chat with provided id does not exist',
					);
					resolve();
				});
			});
		});

		it('should trim all whitespaces in payload string values', async (): Promise<void> => {
			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_MESSAGE, {
				directChatId: `   ${directChat.id}   `,
				messageText: `   ${chatMessage.messageText}   `,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(
					WSEvent.ON_RECEIVE_MESSAGE,
					(data: SuccessfulWSResponseResult<DirectChatMessageWithChatAndUserDto>) => {
						expect(data.data.messageText).toBe(chatMessage.messageText);
						resolve();
					},
				);

				senderSocket.on(WSEvent.ON_ERROR, () => {
					reject(new Error('Message was not created for valid event'));
				});
			});
		});

		it('should emit onReceiveMessage event for sender if message was created', async (): Promise<void> => {
			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_MESSAGE, {
				directChatId: directChat.id,
				messageText: chatMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_RECEIVE_MESSAGE, (data) => {
					expect((data as WSResponseResult).status).toBe(ResponseStatus.SUCCESS);
					resolve();
				});

				senderSocket.on(WSEvent.ON_ERROR, () => {
					reject(new Error('Message was not created for valid event'));
				});
			});
		});

		it('should emit onReceiveMessage event for receiver if message was created and receiver is connected', async (): Promise<void> => {
			senderSocket = await createSocket(senderUser);
			receiverSocket = await createSocket(senderUser);

			senderSocket.connect();
			receiverSocket.connect();

			senderSocket.emit(WSEvent.CREATE_MESSAGE, {
				directChatId: directChat.id,
				messageText: chatMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				receiverSocket.on(WSEvent.ON_RECEIVE_MESSAGE, (data) => {
					expect((data as WSResponseResult).status).toBe(ResponseStatus.SUCCESS);
					resolve();
				});

				senderSocket.on(WSEvent.ON_ERROR, () => {
					reject(new Error('Message was not created for valid event'));
				});
			});
		});
	});
});
