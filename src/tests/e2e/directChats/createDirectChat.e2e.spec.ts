import { INestApplication, ValidationPipe } from '@nestjs/common';
import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { TestDatabaseHelper } from '@testHelpers/TestDatabase.helper';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@modules/app.module';
import { validationPipeConfig } from '@configs/validationPipe.config';
import { GlobalExceptionFilter } from '@filters/globalException.filter';
import { DirectChat, DirectChatMessage, User } from '@db/entities';
import { users } from '@testMocks/User/users';
import * as supertest from 'supertest';
import { io, Socket } from 'socket.io-client';
import { Headers } from '@enums/Headers.enum';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';
import { SuccessfulResponseResult } from '@responses/successfulResponses/SuccessfulResponseResult';
import { LoginResponseDto } from '@dtos/auth/login/LoginResponse.dto';
import { WSEvents } from '@enums/WSEvents.enum';
import { ErrorWSResponseResult } from '@responses/errorResponses/ErrorWSResponseResult';
import { ErrorField } from '@responses/errors/ErrorField';
import { directChats } from '@testMocks/DirectChat/directChats';
import { ResponseStatus } from '@enums/ResponseStatus.enum';
import { WSResponseResult } from '@responses/WSResponseResult';

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

		await app.listen(Number(process.env.TESTS_PORT));
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

		it('should emit error event if receiver id is not valid uuid', async (): Promise<void> => {
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

			senderSocket.emit(WSEvents.CREATE_CHAT, {
				receiverId: '123',
				messageText: initialMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Chat with invalid receiver id was created');
				});

				senderSocket.on(WSEvents.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'Wrong receiverId format. UUID is expected',
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

			senderSocket.emit(WSEvents.CREATE_CHAT, {
				receiverId: receiverUser.id,
				messageText: 555,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Chat with non string message was created');
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

			senderSocket.emit(WSEvents.CREATE_CHAT, {
				receiverId: receiverUser.id,
				messageText: '',
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Chat with empty message was created');
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

			senderSocket.emit(WSEvents.CREATE_CHAT, {
				receiverId: receiverUser.id,
				messageText: 'Hello'.padEnd(501, 'o'),
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Chat with too long message was created');
				});

				senderSocket.on(WSEvents.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'messageText can be 500 characters long maximum',
					);
					resolve();
				});
			});
		});

		it('should emit error event if receiver user does not exist', async (): Promise<void> => {
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

			senderSocket.emit(WSEvents.CREATE_CHAT, {
				receiverId: 'eb6e754b-4607-4b56-a3ae-64c6124eb4b0',
				messageText: initialMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Chat with not existing receiver was created');
				});

				senderSocket.on(WSEvents.ON_ERROR, (error) => {
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

			senderSocket.emit(WSEvents.CREATE_CHAT, {
				receiverId: receiver?.id,
				messageText: initialMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Chat between users that have a direct chat was created');
				});

				senderSocket.on(WSEvents.ON_ERROR, (error) => {
					expect((error as ErrorWSResponseResult<ErrorField[]>).errors[0].message).toBe(
						'Direct chat between these users already exists',
					);
					resolve();
				});
			});
		});

		it('should emit onReceiveMessage event for sender if chat was created', async (): Promise<void> => {
			const loginResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: senderUser.email, password: passwordMock });

			const receiver: User | null = await dataSource
				.getRepository(User)
				.findOne({ where: { email: receiverUser.email } });

			senderSocket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: {
					[Headers.AUTHORIZATION]: `Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			});

			senderSocket.connect();

			senderSocket.emit(WSEvents.CREATE_CHAT, {
				receiverId: receiver?.id,
				messageText: initialMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				senderSocket.on(WSEvents.ON_CREATE_CHAT, (data) => {
					expect((data as WSResponseResult).status).toBe(ResponseStatus.SUCCESS);
					resolve();
				});

				senderSocket.on(WSEvents.ON_ERROR, () => {
					reject('Chat was not created for valid event');
				});
			});
		});

		it('should emit onReceiveMessage event for receiver if chat was created and receiver is connected', async (): Promise<void> => {
			const receiver: User | null = await dataSource
				.getRepository(User)
				.findOne({ where: { email: receiverUser.email } });

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

			senderSocket.emit(WSEvents.CREATE_CHAT, {
				receiverId: receiver?.id,
				messageText: initialMessage.messageText,
			});

			await new Promise<void>((resolve, reject) => {
				receiverSocket.on(WSEvents.ON_CREATE_CHAT, (data) => {
					expect((data as WSResponseResult).status).toBe(ResponseStatus.SUCCESS);
					resolve();
				});

				senderSocket.on(WSEvents.ON_ERROR, () => {
					reject('Chat was not created for valid event');
				});
			});
		});
	});
});
