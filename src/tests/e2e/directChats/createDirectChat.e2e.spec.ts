import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as supertest from 'supertest';
import { io, Socket } from 'socket.io-client';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { DirectChat, DirectChatMessage, User } from '@entities';

import { Header, WSEvent, ResponseStatus, Route } from '@enums';

import { users, directChatsMessages, directChats } from '@testMocks';

import { SuccessfulResponseResult } from '@responses/successfulResponses';
import { ErrorWSResponseResult } from '@responses/errorResponses';
import { ErrorField } from '@responses/errors';
import { WSResponseResult } from '@responses/WSResponseResult';

import { LoginResponseDto } from '@dtos/auth/login';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';

describe('Create direct chat', (): void => {
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

	describe('Create chat event', (): void => {
		let senderSocket: Socket;
		let receiverSocket: Socket;

		const passwordMock: string = 'Qwerty12345!';
		const senderUser: User = users[0];
		const receiverUser: User = users[1];
		const initialMessage: DirectChatMessage = directChatsMessages[1];

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
				extraHeaders: {
					[Header.AUTHORIZATION]: `Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			});
		};

		beforeEach(async (): Promise<void> => {
			await signup(senderUser);
			await signup(receiverUser);
		});

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);

			if (senderSocket && senderSocket.connected) {
				senderSocket.disconnect();
			}

			if (receiverSocket && receiverSocket.connected) {
				receiverSocket.disconnect();
			}
		});

		it('should reject connection if user does not provided authorization header', async (): Promise<void> => {
			senderSocket = io(await app.getUrl(), { transports: ['websocket'] });

			senderSocket.connect();

			await new Promise<void>((resolve, reject) => {
				senderSocket.on('connect', (): void => {
					reject('Unauthorized socket connected');
				});

				senderSocket.on('connect_error', (error: Error) => {
					expect(error.message).toBe('Unauthorized Exception');
					resolve();
				});
			});
		});

		it('should reject connection if user provided empty authorization header', async (): Promise<void> => {
			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: { [Header.AUTHORIZATION]: '' },
			});

			senderSocket.connect();

			await new Promise<void>((resolve, reject) => {
				senderSocket.on('connect', (): void => {
					reject('Unauthorized socket connected');
				});

				senderSocket.on('connect_error', (error: Error) => {
					expect(error.message).toBe('Unauthorized Exception');
					resolve();
				});
			});
		});

		it('should reject connection if user provided authorization header without access token', async (): Promise<void> => {
			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: { [Header.AUTHORIZATION]: 'Bearer ' },
			});

			senderSocket.connect();

			await new Promise<void>((resolve, reject) => {
				senderSocket.on('connect', (): void => {
					reject('Unauthorized socket connected');
				});

				senderSocket.on('connect_error', (error: Error) => {
					expect(error.message).toBe('Unauthorized Exception');
					resolve();
				});
			});
		});

		it('should reject connection if user provided authorization header with invalid access token', async (): Promise<void> => {
			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: { [Header.AUTHORIZATION]: 'Bearer invalidAccessToken' },
			});

			senderSocket.connect();

			await new Promise<void>((resolve, reject) => {
				senderSocket.on('connect', (): void => {
					reject('Unauthorized socket connected');
				});

				senderSocket.on('connect_error', (error: Error) => {
					expect(error.message).toBe('Unauthorized Exception');
					resolve();
				});
			});
		});

		it('should emit error event if receiver id is not valid uuid', async (): Promise<void> => {
			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_CHAT, {
				receiverId: '123',
				messageText: initialMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_CREATE_CHAT, () => {
					reject('Chat with invalid receiver id was created');
				});

				senderSocket.on(WSEvent.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'Wrong receiverId format. UUID is expected',
					);
					resolve();
				});
			});
		});

		it('should emit error event if message text is not a string', async (): Promise<void> => {
			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_CHAT, {
				receiverId: receiverUser.id,
				messageText: 555,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_CREATE_CHAT, () => {
					reject('Chat with non string message was created');
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

			senderSocket.emit(WSEvent.CREATE_CHAT, {
				receiverId: receiverUser.id,
				messageText: '',
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_CREATE_CHAT, () => {
					reject('Chat with empty message was created');
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

			senderSocket.emit(WSEvent.CREATE_CHAT, {
				receiverId: receiverUser.id,
				messageText: 'Hello'.padEnd(501, 'o'),
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_CREATE_CHAT, () => {
					reject('Chat with too long message was created');
				});

				senderSocket.on(WSEvent.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'messageText can be 500 characters long maximum',
					);
					resolve();
				});
			});
		});

		it('should emit error event if receiver user does not exist', async (): Promise<void> => {
			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_CHAT, {
				receiverId: 'eb6e754b-4607-4b56-a3ae-64c6124eb4b0',
				messageText: initialMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_CREATE_CHAT, () => {
					reject('Chat with not existing receiver was created');
				});

				senderSocket.on(WSEvent.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'One of the chat members does not exist',
					);
					resolve();
				});
			});
		});

		it('should emit error event if chat between users already exist', async (): Promise<void> => {
			const sender: User | null = await dataSource
				.getRepository(User)
				.findOne({ where: { email: senderUser.email } });

			const receiver: User | null = await dataSource
				.getRepository(User)
				.findOne({ where: { email: receiverUser.email } });

			const existingChat: DirectChat = dataSource.getRepository(DirectChat).create({
				...directChats[2],
				users: [sender, receiver] as User[],
			});
			const existingChatMessage: DirectChatMessage = dataSource
				.getRepository(DirectChatMessage)
				.create({ ...directChatsMessages[2], directChat: existingChat, sender: sender as User });

			await dataSource.getRepository(DirectChat).save([existingChat]);
			await dataSource.getRepository(DirectChatMessage).save([existingChatMessage]);

			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_CHAT, {
				receiverId: receiver?.id,
				messageText: initialMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_CREATE_CHAT, () => {
					reject('Chat between users that have a direct chat was created');
				});

				senderSocket.on(WSEvent.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'Direct chat between these users already exists',
					);
					resolve();
				});
			});
		});

		it('should trim all whitespaces in payload string values', async (): Promise<void> => {
			const receiver: User | null = await dataSource
				.getRepository(User)
				.findOne({ where: { email: receiverUser.email } });

			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_CHAT, {
				receiverId: `   ${receiver?.id}   `,
				messageText: `   ${initialMessage.messageText}   `,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(
					WSEvent.ON_CREATE_CHAT,
					(data: SuccessfulResponseResult<DirectChatWithUsersAndMessagesDto>) => {
						expect(data.data.messages[0].messageText).toBe(initialMessage.messageText);
						resolve();
					},
				);

				senderSocket.on(WSEvent.ON_ERROR, () => {
					reject('Chat was not created for valid event');
				});
			});
		});

		it('should emit onCreateChat event for sender if chat was created', async (): Promise<void> => {
			const receiver: User = (await dataSource
				.getRepository(User)
				.findOne({ where: { email: receiverUser.email } })) as User;

			senderSocket = await createSocket(senderUser);

			senderSocket.connect();

			senderSocket.emit(WSEvent.CREATE_CHAT, {
				receiverId: receiver?.id,
				messageText: initialMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvent.ON_CREATE_CHAT, (data) => {
					expect((data as WSResponseResult).status).toBe(ResponseStatus.SUCCESS);
					resolve();
				});

				senderSocket.on(WSEvent.ON_ERROR, () => {
					reject('Chat was not created for valid event');
				});
			});
		});

		it('should emit onCreateChat event for receiver if chat was created and receiver is connected', async (): Promise<void> => {
			const receiver: User | null = await dataSource
				.getRepository(User)
				.findOne({ where: { email: receiverUser.email } });

			senderSocket = await createSocket(senderUser);
			receiverSocket = await createSocket(senderUser);

			senderSocket.connect();
			receiverSocket.connect();

			senderSocket.emit(WSEvent.CREATE_CHAT, {
				receiverId: receiver?.id,
				messageText: initialMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				receiverSocket.on(WSEvent.ON_CREATE_CHAT, (data) => {
					expect((data as WSResponseResult).status).toBe(ResponseStatus.SUCCESS);
					resolve();
				});

				senderSocket.on(WSEvent.ON_ERROR, () => {
					reject('Chat was not created for valid event');
				});
			});
		});
	});
});
