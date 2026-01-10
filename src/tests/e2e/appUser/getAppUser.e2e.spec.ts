import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';
import * as supertest from 'supertest';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { User } from '@entities';

import { users } from '@testMocks';

import { Header, Route } from '@enums';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

import { LoginResponseDto } from '@dtos/auth/login';
import { UserWithAccountSettingsDto } from '@dtos/users';

describe('Get app user', (): void => {
	let app: INestApplication;
	let postgresContainer: StartedTestContainer;
	let dataSource: DataSource;

	const route: string = `/${Route.APP_USER}`;

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
		app.use(cookieParser(process.env.COOKIE_SECRET));

		await app.listen(Number(process.env.PORT));
	});

	afterAll(async (): Promise<void> => {
		await dataSource.destroy();
		await postgresContainer.stop();
		await app.close();
	});

	describe(`GET ${route}`, (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[0];

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
				.set(Header.AUTHORIZATION, 'Bearer accessToken');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 200 OK status if user logged in', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken = await login(agent);

			const appUserResponse: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(appUserResponse.status).toBe(HttpStatus.OK);
		});

		it('should return information about current logged in user', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken = await login(agent);

			const appUserResponse: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			const userNickname: string = (
				appUserResponse.body as SuccessfulResponseResult<UserWithAccountSettingsDto>
			).data.nickname;
			const userEmail: string = (
				appUserResponse.body as SuccessfulResponseResult<UserWithAccountSettingsDto>
			).data.email;

			expect(userNickname).toBe(createdUser.nickname);
			expect(userEmail).toBe(createdUser.email);
		});

		it('should include information about current logged in user account settings', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken = await login(agent);

			const appUserResponse: supertest.Response = await agent
				.get(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			const userAccountSettingsId: string = (
				appUserResponse.body as SuccessfulResponseResult<UserWithAccountSettingsDto>
			).data.accountSettings.id;

			expect(userAccountSettingsId).toBeDefined();
		});
	});
});
