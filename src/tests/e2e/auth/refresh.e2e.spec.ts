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

import { CookiesNames, Headers } from '@enums';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

import { LoginResponseDto } from '@dtos/auth/login';

describe('Refresh', (): void => {
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
		app.use(cookieParser(process.env.COOKIE_SECRET));

		await app.listen(Number(process.env.TESTS_PORT));
	});

	afterAll(async (): Promise<void> => {
		await dataSource.destroy();
		await postgresContainer.stop();
		await app.close();
	});

	describe('PATCH /auth/refresh', (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[7];

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);
		});

		it('should return 401 Unauthorized error if user does not have refresh token cookie', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/refresh');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user have refresh token cookie but without access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/refresh')
				.set('Cookie', [`${CookiesNames.REFRESH_TOKEN}=`]);

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user have refresh token cookie with invalid refresh token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/refresh')
				.set('Cookie', [`${CookiesNames.REFRESH_TOKEN}=refreshToken`]);

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 200 OK status if refresh and access token were changed', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await agent.post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			await agent.post('/auth/login').send({ email: createdUser.email, password: passwordMock });

			const response: supertest.Response = await agent.patch('/auth/refresh');

			expect(response.status).toBe(HttpStatus.OK);
		});

		it('should return new access token in response body data', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await agent.post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			await agent.post('/auth/login').send({ email: createdUser.email, password: passwordMock });

			const response: supertest.Response = await agent.patch('/auth/refresh');

			expect(
				(response.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken,
			).toBeDefined();
		});

		it('should save new refresh token in user cookies', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await agent.post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			await agent.post('/auth/login').send({ email: createdUser.email, password: passwordMock });

			const response: supertest.Response = await agent.patch('/auth/refresh');

			const cookies: string[] = response.get(Headers.SET_COOKIE) || [];

			expect(
				cookies.some((cookie: string) => cookie.startsWith(`${CookiesNames.REFRESH_TOKEN}=`)),
			).toBe(true);
		});
	});
});
