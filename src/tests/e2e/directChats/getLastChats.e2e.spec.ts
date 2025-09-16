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
import { directChats } from '@testMocks/DirectChat/directChats';
import { accountSettings } from '@testMocks/AccountSettings/accountSettings';
import { SuccessfulResponseResult } from '@responses/successfulResponses/SuccessfulResponseResult';
import { LoginResponseDto } from '@dtos/auth/login/LoginResponse.dto';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import { UserDto } from '@dtos/users/UserDto';

describe('Get last chats', (): void => {
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

	describe('GET /direct-chats', (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[2];
		const chatUser: User = users[3];

		beforeEach(async (): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			const userOne = await dataSource
				.getRepository(User)
				.findOne({ where: { email: createdUser.email } });

			const userTwoAccountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(accountSettings[2]);

			const userTwo: User = dataSource
				.getRepository(User)
				.create({ ...chatUser, accountSettings: userTwoAccountSettings });

			const directChatOne: DirectChat = dataSource
				.getRepository(DirectChat)
				.create({ ...directChats[0], users: [{ id: userOne?.id }, { id: userTwo.id }] });
			const directChatTwo: DirectChat = dataSource
				.getRepository(DirectChat)
				.create({ ...directChats[1], users: [{ id: userOne?.id }, { id: userTwo.id }] });
			const directChatThree: DirectChat = dataSource
				.getRepository(DirectChat)
				.create({ ...directChats[2], users: [{ id: userOne?.id }, { id: userTwo.id }] });
			const directChatFour: DirectChat = dataSource
				.getRepository(DirectChat)
				.create({ ...directChats[3], users: [{ id: userOne?.id }, { id: userTwo.id }] });

			await dataSource.getRepository(AccountSettings).save([userTwoAccountSettings]);
			await dataSource.getRepository(User).save([userTwo]);
			await dataSource
				.getRepository(DirectChat)
				.save([directChatOne, directChatTwo, directChatThree, directChatFour]);
		});

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);
		});

		it('should return 401 Unauthorized error if user does not provided authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/direct-chats');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided empty authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/direct-chats')
				.set(Headers.AUTHORIZATION, '');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header without access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/direct-chats')
				.set(Headers.AUTHORIZATION, 'Bearer');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header with invalid access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/direct-chats')
				.set(Headers.AUTHORIZATION, 'Bearer accessToken');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should 200 OK status if chats were found', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const chatsResponse: supertest.Response = await agent
				.get('/direct-chats')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ page: 1, take: 10 });

			expect(chatsResponse.status).toBe(HttpStatus.OK);
		});

		it('should 200 OK status if user does not have chats', async (): Promise<void> => {
			await dataSource
				.getRepository(DirectChat)
				.remove(await dataSource.getRepository(DirectChat).find());

			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const chatsResponse: supertest.Response = await agent
				.get('/direct-chats')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ page: 1, take: 10 });

			expect(chatsResponse.status).toBe(HttpStatus.OK);
		});

		it('should return only chats with current logged in user', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const chatsResponse: supertest.Response = await agent
				.get('/direct-chats')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ page: 1, take: 10 });

			const directChats: DirectChatWithUsersAndMessagesDto[] = (
				chatsResponse.body as SuccessfulResponseResult<DirectChatWithUsersAndMessagesDto[]>
			).data;

			directChats.forEach((chat: DirectChatWithUsersAndMessagesDto) => {
				expect(chat.users.some((user: UserDto) => user.email === createdUser.email)).toBe(true);
			});
		});

		it('should limit number of chats to take query parameter', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const takeParameter: number = 2;

			const chatsResponse: supertest.Response = await agent
				.get('/direct-chats')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ page: 1, take: takeParameter });

			const directChats: DirectChatWithUsersAndMessagesDto[] = (
				chatsResponse.body as SuccessfulResponseResult<DirectChatWithUsersAndMessagesDto[]>
			).data;

			expect(directChats.length).toBe(takeParameter);
		});

		it('should return different chats for different page query parameter', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const chatsResponseOne: supertest.Response = await agent
				.get('/direct-chats')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ page: 1, take: 2 });

			const chatsResponseTwo: supertest.Response = await agent
				.get('/direct-chats')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ page: 2, take: 2 });

			const directChatsOne: string[] = (
				chatsResponseOne.body as SuccessfulResponseResult<DirectChatWithUsersAndMessagesDto[]>
			).data
				.map((chat: DirectChatWithUsersAndMessagesDto) => chat.id)
				.sort((first: string, second: string) => first.localeCompare(second));

			const directChatsTwo: string[] = (
				chatsResponseTwo.body as SuccessfulResponseResult<DirectChatWithUsersAndMessagesDto[]>
			).data
				.map((chat: DirectChatWithUsersAndMessagesDto) => chat.id)
				.sort((first: string, second: string) => first.localeCompare(second));

			expect(directChatsOne).not.toEqual(directChatsTwo);
		});
	});
});
