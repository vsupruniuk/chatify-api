import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { TestDatabaseHelper } from '@testHelpers/TestDatabase.helper';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@modules/app.module';
import { validationPipeConfig } from '@configs/validationPipe.config';
import { GlobalExceptionFilter } from '@filters/globalException.filter';
import { AccountSettings, User } from '@db/entities';
import { users } from '@testMocks/User/users';
import * as supertest from 'supertest';
import { Headers } from '@enums/Headers.enum';
import { accountSettings } from '@testMocks/AccountSettings/accountSettings';
import { SuccessfulResponseResult } from '@responses/successfulResponses/SuccessfulResponseResult';
import { LoginResponseDto } from '@dtos/auth/login/LoginResponse.dto';
import { UserDto } from '@dtos/users/UserDto';

describe('Find users', (): void => {
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

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await dataSource.destroy();
		await postgresContainer.stop();
		await app.close();
	});

	describe('GET /search/find-users', (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[1];

		const nicknamePattern: string = 'to';

		beforeEach(async (): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			const accountSettingsOne: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(accountSettings[2]);
			const userOne: User = dataSource
				.getRepository(User)
				.create({ ...users[2], nickname: 'tony.stark', accountSettings: accountSettingsOne });

			const accountSettingsTwo: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(accountSettings[3]);
			const userTwo: User = dataSource
				.getRepository(User)
				.create({ ...users[3], nickname: 'tomas.theCat', accountSettings: accountSettingsTwo });

			const accountSettingsThree: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(accountSettings[4]);
			const userThree: User = dataSource
				.getRepository(User)
				.create({ ...users[4], nickname: 'tom.riddle', accountSettings: accountSettingsThree });

			const accountSettingsFour: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(accountSettings[5]);
			const userFour: User = dataSource
				.getRepository(User)
				.create({ ...users[5], nickname: 'tommy.shelby', accountSettings: accountSettingsFour });

			await dataSource
				.getRepository(AccountSettings)
				.save([accountSettingsOne, accountSettingsTwo, accountSettingsThree, accountSettingsFour]);
			await dataSource.getRepository(User).save([userOne, userTwo, userThree, userFour]);
		});

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);
		});

		it('should return 401 Unauthorized error if user does not provided authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/search/find-users');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided empty authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/search/find-users')
				.set(Headers.AUTHORIZATION, '');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header without access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/search/find-users')
				.set(Headers.AUTHORIZATION, 'Bearer');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header with invalid access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/search/find-users')
				.set(Headers.AUTHORIZATION, 'Bearer accessToken');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 400 Bad Request error if nickname query parameter is missing', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const usersResponse: supertest.Response = await agent
				.get('/search/find-users')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ page: 1, take: 10 });

			expect(usersResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 200 OK status if request is valid', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const usersResponse: supertest.Response = await agent
				.get('/search/find-users')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ nickname: nicknamePattern, page: 1, take: 10 });

			expect(usersResponse.status).toBe(HttpStatus.OK);
		});

		it('should return 200 OK status if page and take query parameters are missing', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const usersResponse: supertest.Response = await agent
				.get('/search/find-users')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ nickname: nicknamePattern, page: 1, take: 10 });

			expect(usersResponse.status).toBe(HttpStatus.OK);
		});

		it('should return only users with nicknames containing nickname pattern', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const usersResponse: supertest.Response = await agent
				.get('/search/find-users')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ nickname: nicknamePattern, page: 1, take: 10 });

			const users: UserDto[] = (usersResponse.body as SuccessfulResponseResult<UserDto[]>).data;

			users.forEach((user: UserDto) => {
				expect(user.nickname.includes(nicknamePattern)).toBe(true);
			});
		});

		it('should limit number of users based on take query parameter', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const usersToGet: number = 2;

			const usersResponse: supertest.Response = await agent
				.get('/search/find-users')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ nickname: nicknamePattern, page: 1, take: usersToGet });

			const users: UserDto[] = (usersResponse.body as SuccessfulResponseResult<UserDto[]>).data;

			expect(users.length).toBe(usersToGet);
		});

		it('should return different users for different page parameter', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const usersResponseFirstPage: supertest.Response = await agent
				.get('/search/find-users')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ nickname: nicknamePattern, page: 1, take: 2 });

			const usersFirstPage: string[] = (
				usersResponseFirstPage.body as SuccessfulResponseResult<UserDto[]>
			).data
				.map((user: UserDto) => user.email)
				.sort((first: string, second: string) => first.localeCompare(second));

			const usersResponseSecondPage: supertest.Response = await agent
				.get('/search/find-users')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				)
				.query({ nickname: nicknamePattern, page: 2, take: 2 });

			const usersSecondPage: string[] = (
				usersResponseSecondPage.body as SuccessfulResponseResult<UserDto[]>
			).data
				.map((user: UserDto) => user.email)
				.sort((first: string, second: string) => first.localeCompare(second));

			expect(usersFirstPage).not.toEqual(usersSecondPage);
		});
	});
});
