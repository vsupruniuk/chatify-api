import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as supertest from 'supertest';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { AccountSettings, DirectChat, User } from '@entities';

import { users, directChats, accountSettings } from '@testMocks';

import { Header, Route } from '@enums';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

import { LoginResponseDto } from '@dtos/auth/login';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { UserDto } from '@dtos/users';

describe('Get last chats', (): void => {
	let app: INestApplication;
	let postgresContainer: StartedTestContainer;
	let dataSource: DataSource;

	const route: string = `/${Route.DIRECT_CHATS}`;

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

	describe(`GET ${route}`, (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[2];

		const login = async (agent: ReturnType<typeof supertest.agent>): Promise<string> => {
			const loginResponse: supertest.Response = await agent
				.post(`/${Route.AUTH}/${Route.LOGIN}`)
				.send({ email: createdUser.email, password: passwordMock });

			return (loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken;
		};

		beforeEach(async (): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post(`/${Route.AUTH}/${Route.SIGNUP}`).send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			const userCreated: User = (await dataSource
				.getRepository(User)
				.findOne({ where: { email: createdUser.email } })) as User;

			const userOneAccountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(accountSettings[2]);
			const userOne: User = dataSource
				.getRepository(User)
				.create({ ...users[3], accountSettings: userOneAccountSettings });

			const userTwoAccountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(accountSettings[3]);
			const userTwo: User = dataSource
				.getRepository(User)
				.create({ ...users[4], accountSettings: userTwoAccountSettings });

			const userThreeAccountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(accountSettings[4]);
			const userThree: User = dataSource
				.getRepository(User)
				.create({ ...users[5], accountSettings: userThreeAccountSettings });

			const userFourAccountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(accountSettings[5]);
			const userFour: User = dataSource
				.getRepository(User)
				.create({ ...users[6], accountSettings: userFourAccountSettings });

			const directChatOne: DirectChat = dataSource
				.getRepository(DirectChat)
				.create({ ...directChats[0], users: [{ id: userCreated.id }, { id: userOne.id }] });
			const directChatTwo: DirectChat = dataSource
				.getRepository(DirectChat)
				.create({ ...directChats[1], users: [{ id: userCreated.id }, { id: userTwo.id }] });
			const directChatThree: DirectChat = dataSource
				.getRepository(DirectChat)
				.create({ ...directChats[2], users: [{ id: userCreated.id }, { id: userThree.id }] });
			const directChatFour: DirectChat = dataSource
				.getRepository(DirectChat)
				.create({ ...directChats[3], users: [{ id: userCreated.id }, { id: userFour.id }] });

			await dataSource
				.getRepository(AccountSettings)
				.save([
					userOneAccountSettings,
					userTwoAccountSettings,
					userThreeAccountSettings,
					userFourAccountSettings,
				]);
			await dataSource.getRepository(User).save([userOne, userTwo, userThree, userFour]);
			await dataSource
				.getRepository(DirectChat)
				.save([directChatOne, directChatTwo, directChatThree, directChatFour]);
		});

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);
		});

		it('should return 401 Unauthorized error if user does not provided authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest.agent(app.getHttpServer()).get(route);

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided empty authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get(route)
				.set(Header.AUTHORIZATION, '');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header without access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get(route)
				.set(Header.AUTHORIZATION, 'Bearer');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header with invalid access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get(route)
				.set(Header.AUTHORIZATION, 'Bearer invalidAccessToken');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should 400 Bad Request error if page query parameter is less than 1', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const chatsResponse: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`)
				.query({ page: 0, take: 10 });

			expect(chatsResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should 400 Bad Request error if take query parameter is less than 1', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const chatsResponse: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`)
				.query({ page: 1, take: 0 });

			expect(chatsResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should 200 OK status if chats were found', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const chatsResponse: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`)
				.query({ page: 1, take: 10 });

			expect(chatsResponse.status).toBe(HttpStatus.OK);
		});

		it('should 200 OK status if pagination query parameters were not provided', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const chatsResponse: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(chatsResponse.status).toBe(HttpStatus.OK);
		});

		it('should 200 OK status if user does not have chats', async (): Promise<void> => {
			await dataSource
				.getRepository(DirectChat)
				.remove(await dataSource.getRepository(DirectChat).find());

			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const chatsResponse: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`)
				.query({ page: 1, take: 10 });

			expect(chatsResponse.status).toBe(HttpStatus.OK);
		});

		it('should return only chats with current logged in user', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const chatsResponse: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`)
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

			const accessToken: string = await login(agent);

			const takeParameter: number = 2;

			const chatsResponse: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`)
				.query({ page: 1, take: takeParameter });

			const directChats: DirectChatWithUsersAndMessagesDto[] = (
				chatsResponse.body as SuccessfulResponseResult<DirectChatWithUsersAndMessagesDto[]>
			).data;

			expect(directChats).toHaveLength(takeParameter);
		});

		it('should return different chats for different page query parameter', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const chatsResponseOne: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`)
				.query({ page: 1, take: 2 });

			const chatsResponseTwo: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`)
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
