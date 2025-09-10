import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { TestDatabaseHelper } from '@testHelpers/TestDatabase.helper';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@modules/app.module';
import { validationPipeConfig } from '@configs/validationPipe.config';
import { GlobalExceptionFilter } from '@filters/globalException.filter';
import { AccountSettings, DirectChat, User } from '@db/entities';
import { users } from '@testMocks/User/users';
import * as supertest from 'supertest';
import { Headers } from '@enums/Headers.enum';
import { accountSettings } from '@testMocks/AccountSettings/accountSettings';
import { directChats } from '@testMocks/DirectChat/directChats';
import { SuccessfulResponseResult } from '@responses/successfulResponses/SuccessfulResponseResult';
import { LoginResponseDto } from '@dtos/auth/login/LoginResponse.dto';
import { io, Socket } from 'socket.io-client';
import { WSEvents } from '@enums/WSEvents.enum';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages/DirectChatMessageWithChatAndUser.dto';

describe('Get chat messages', (): void => {
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

	describe('GET /direct-chats/chat-messages', (): void => {
		let socket: Socket;

		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[3];

		const userDirectChat: DirectChat = directChats[0];
		const notUserDirectChat: DirectChat = directChats[1];

		beforeEach(async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await agent.post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			socket = io(await app.getUrl(), {
				transports: ['websocket'],
				extraHeaders: {
					[Headers.AUTHORIZATION]: `Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				},
			}).connect();

			const userTwoAccountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(accountSettings[0]);
			const userThreeAccountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(accountSettings[1]);

			const userOne = await dataSource
				.getRepository(User)
				.findOne({ where: { email: createdUser.email } });
			const userTwo: User = dataSource
				.getRepository(User)
				.create({ ...users[4], accountSettings: userTwoAccountSettings });
			const userThree: User = dataSource
				.getRepository(User)
				.create({ ...users[5], accountSettings: userThreeAccountSettings });

			const directChatOne: DirectChat = dataSource
				.getRepository(DirectChat)
				.create({ ...userDirectChat, users: [{ id: userOne?.id }, { id: userTwo.id }] });
			const directChatTwo: DirectChat = dataSource
				.getRepository(DirectChat)
				.create({ ...notUserDirectChat, users: [{ id: userTwo.id }, { id: userThree.id }] });

			await dataSource
				.getRepository(AccountSettings)
				.save([userTwoAccountSettings, userThreeAccountSettings]);
			await dataSource.getRepository(User).save([userTwo, userThree]);
			await dataSource.getRepository(DirectChat).save([directChatOne, directChatTwo]);

			socket.emit(WSEvents.SEND_MESSAGE, {
				directChatId: userDirectChat.id,
				messageText: directChatsMessages[0].messageText,
			});
			socket.emit(WSEvents.SEND_MESSAGE, {
				directChatId: userDirectChat.id,
				messageText: directChatsMessages[1].messageText,
			});
			socket.emit(WSEvents.SEND_MESSAGE, {
				directChatId: userDirectChat.id,
				messageText: directChatsMessages[2].messageText,
			});
			socket.emit(WSEvents.SEND_MESSAGE, {
				directChatId: userDirectChat.id,
				messageText: directChatsMessages[3].messageText,
			});
		});

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);
			socket.disconnect();
		});

		it('should return 401 Unauthorized error if user does not provided authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/direct-chats/chat-messages');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided empty authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/direct-chats/chat-messages')
				.set(Headers.AUTHORIZATION, '');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header without access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/direct-chats/chat-messages')
				.set(Headers.AUTHORIZATION, 'Bearer');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header with invalid access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/direct-chats/chat-messages')
				.set(Headers.AUTHORIZATION, 'Bearer accessToken');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 400 Bad Request error if chat id query parameter is missing', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const chatMessagesResponse: supertest.Response = await agent
				.get('/direct-chats/chat-messages')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ page: 1, take: 10 });

			expect(chatMessagesResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if user does not belong to the requested chat', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const chatMessagesResponse: supertest.Response = await agent
				.get('/direct-chats/chat-messages')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ chatId: notUserDirectChat.id, page: 1, take: 10 });

			expect(chatMessagesResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 404 Not Found error if chat does not exist', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const chatMessagesResponse: supertest.Response = await agent
				.get('/direct-chats/chat-messages')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ chatId: '2c92a8a5-beff-466d-9226-cb52ea477d7a', page: 1, take: 10 });

			expect(chatMessagesResponse.status).toBe(HttpStatus.NOT_FOUND);
		});

		it('should return 200 OK status if messages were found', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const chatMessagesResponse: supertest.Response = await agent
				.get('/direct-chats/chat-messages')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ chatId: userDirectChat.id, page: 1, take: 10 });

			expect(chatMessagesResponse.status).toBe(HttpStatus.OK);
		});

		it('should return only messages that belongs to the requested chat', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const chatMessagesResponse: supertest.Response = await agent
				.get('/direct-chats/chat-messages')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ chatId: userDirectChat.id, page: 1, take: 10 });

			const messages: DirectChatMessageWithChatAndUserDto[] = (
				chatMessagesResponse.body as SuccessfulResponseResult<DirectChatMessageWithChatAndUserDto[]>
			).data;

			messages.forEach((message: DirectChatMessageWithChatAndUserDto) => {
				expect(message.directChat.id).toBe(userDirectChat.id);
			});
		});

		it('should return limit messages count to take query parameter', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const takeParameter: number = 2;

			const chatMessagesResponse: supertest.Response = await agent
				.get('/direct-chats/chat-messages')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ chatId: userDirectChat.id, page: 1, take: takeParameter });

			const messages: DirectChatMessageWithChatAndUserDto[] = (
				chatMessagesResponse.body as SuccessfulResponseResult<DirectChatMessageWithChatAndUserDto[]>
			).data;

			expect(messages.length).toBe(takeParameter);
		});

		it('should return different messages for different page query parameter', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const chatMessagesResponseOne: supertest.Response = await agent
				.get('/direct-chats/chat-messages')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ chatId: userDirectChat.id, page: 1, take: 2 });

			const chatMessagesResponseTwo: supertest.Response = await agent
				.get('/direct-chats/chat-messages')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ chatId: userDirectChat.id, page: 2, take: 2 });

			const messagesOne: string[] = (
				chatMessagesResponseOne.body as SuccessfulResponseResult<
					DirectChatMessageWithChatAndUserDto[]
				>
			).data
				.map((message: DirectChatMessageWithChatAndUserDto) => message.id)
				.sort((first: string, second: string) => first.localeCompare(second));

			const messagesTwo: string[] = (
				chatMessagesResponseTwo.body as SuccessfulResponseResult<
					DirectChatMessageWithChatAndUserDto[]
				>
			).data
				.map((message: DirectChatMessageWithChatAndUserDto) => message.id)
				.sort((first: string, second: string) => first.localeCompare(second));

			expect(messagesOne).not.toEqual(messagesTwo);
		});
	});
});
