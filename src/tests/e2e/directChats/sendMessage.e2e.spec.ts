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

import { Headers, WSEvents, ResponseStatus } from '@enums';

import { SuccessfulResponseResult } from '@responses/successfulResponses';
import { ErrorWSResponseResult } from '@responses/errorResponses';
import { WSResponseResult } from '@responses';
import { ErrorField } from '@responses/errors';

import { LoginResponseDto } from '@dtos/auth/login';

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

		await app.listen(Number(process.env.TESTS_PORT));
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

		beforeEach(async (): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post('/auth/signup').send({
				email: senderUser.email,
				firstName: senderUser.firstName,
				lastName: senderUser.lastName,
				nickname: senderUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			await supertest.agent(app.getHttpServer()).post('/auth/signup').send({
				email: receiverUser.email,
				firstName: receiverUser.firstName,
				lastName: receiverUser.lastName,
				nickname: receiverUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

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
				extraHeaders: { [Headers.AUTHORIZATION]: '' },
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
				extraHeaders: { [Headers.AUTHORIZATION]: 'Bearer ' },
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
				extraHeaders: { [Headers.AUTHORIZATION]: 'Bearer accessToken' },
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

		it('should emit error event if direct chat id is not valid uuid', async (): Promise<void> => {
			const loginResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: senderUser.email, password: passwordMock });

			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: {
					[Headers.AUTHORIZATION]: `Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			});

			senderSocket.connect();

			senderSocket.emit(WSEvents.SEND_MESSAGE, {
				directChatId: '123',
				messageText: chatMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_RECEIVE_MESSAGE, () => {
					reject('Message with invalid direct chat id was created');
				});

				senderSocket.on(WSEvents.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'Wrong directChatId format. UUID is expected',
					);
					resolve();
				});
			});
		});

		it('should emit error event if message text is not a string', async (): Promise<void> => {
			const loginResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: senderUser.email, password: passwordMock });

			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: {
					[Headers.AUTHORIZATION]: `Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			});

			senderSocket.connect();

			senderSocket.emit(WSEvents.SEND_MESSAGE, {
				directChatId: directChat.id,
				messageText: 555,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_RECEIVE_MESSAGE, () => {
					reject('Message with non string message was created');
				});

				senderSocket.on(WSEvents.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'messageText must be a string',
					);
					resolve();
				});
			});
		});

		it('should emit error event if message text is empty string', async (): Promise<void> => {
			const loginResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: senderUser.email, password: passwordMock });

			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: {
					[Headers.AUTHORIZATION]: `Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			});

			senderSocket.connect();

			senderSocket.emit(WSEvents.SEND_MESSAGE, {
				directChatId: directChat.id,
				messageText: '',
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_RECEIVE_MESSAGE, () => {
					reject('Message with empty message was created');
				});

				senderSocket.on(WSEvents.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'messageText must be at least 1 characters long',
					);
					resolve();
				});
			});
		});

		it('should emit error event if message text is more than 500 characters long', async (): Promise<void> => {
			const loginResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: senderUser.email, password: passwordMock });

			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: {
					[Headers.AUTHORIZATION]: `Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			});

			senderSocket.connect();

			senderSocket.emit(WSEvents.SEND_MESSAGE, {
				directChatId: directChat.id,
				messageText: 'Hello'.padEnd(501, 'o'),
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_RECEIVE_MESSAGE, () => {
					reject('Message with too long message was created');
				});

				senderSocket.on(WSEvents.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'messageText can be 500 characters long maximum',
					);
					resolve();
				});
			});
		});

		it('should emit error event if direct chat does not exist', async (): Promise<void> => {
			const loginResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: senderUser.email, password: passwordMock });

			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: {
					[Headers.AUTHORIZATION]: `Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			});

			senderSocket.connect();

			senderSocket.emit(WSEvents.SEND_MESSAGE, {
				directChatId: '5be24a59-5855-443e-aa7b-ad02207376cd',
				messageText: chatMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_RECEIVE_MESSAGE, () => {
					reject('Message with not existing direct chat was created');
				});

				senderSocket.on(WSEvents.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'Direct chat with provided id does not exist',
					);
					resolve();
				});
			});
		});

		it('should emit onReceiveMessage event for sender if message was created', async (): Promise<void> => {
			const loginResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: senderUser.email, password: passwordMock });

			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: {
					[Headers.AUTHORIZATION]: `Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			});

			senderSocket.connect();

			senderSocket.emit(WSEvents.SEND_MESSAGE, {
				directChatId: directChat.id,
				messageText: chatMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_RECEIVE_MESSAGE, (data) => {
					expect((data as WSResponseResult).status).toBe(ResponseStatus.SUCCESS);
					resolve();
				});

				senderSocket.on(WSEvents.ON_ERROR, () => {
					reject('Message was not created for valid event');
				});
			});
		});

		it('should emit onReceiveMessage event for receiver if message was created and receiver is connected', async (): Promise<void> => {
			const senderLoginResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: senderUser.email, password: passwordMock });

			const receiverLoginResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: receiverUser.email, password: passwordMock });

			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: {
					[Headers.AUTHORIZATION]: `Bearer ${(senderLoginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			});

			receiverSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: {
					[Headers.AUTHORIZATION]: `Bearer ${(receiverLoginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			});

			senderSocket.connect();
			receiverSocket.connect();

			senderSocket.emit(WSEvents.SEND_MESSAGE, {
				directChatId: directChat.id,
				messageText: chatMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				receiverSocket.on(WSEvents.ON_RECEIVE_MESSAGE, (data) => {
					expect((data as WSResponseResult).status).toBe(ResponseStatus.SUCCESS);
					resolve();
				});

				senderSocket.on(WSEvents.ON_ERROR, () => {
					reject('Message was not created for valid event');
				});
			});
		});
	});
});
