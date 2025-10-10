import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as supertest from 'supertest';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { User } from '@entities';

import { users } from '@testMocks';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

import { LoginResponseDto } from '@dtos/auth/login';

import { Headers, CookiesNames } from '@enums';

describe('Login', (): void => {
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

	describe('POST /auth/login', (): void => {
		const passwordMock: string = 'Qwerty12345!';

		const createdUser: User = users[5];
		const notCreatedUser: User = users[4];

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);
		});

		it('should return 400 Bad Request error if email is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ password: passwordMock });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: null, password: passwordMock });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is not valid', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: 't.stark', password: passwordMock });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: createdUser.email.padStart(256, 't'), password: passwordMock });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: createdUser.email });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: createdUser.email, password: null });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password is less than 6 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: createdUser.email, password: 'Qwert' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password is more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock.padEnd(256, '!') });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password does not include at least 1 number', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: createdUser.email, password: 'Qwerty!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password does not include at least 1 uppercase letter', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: createdUser.email, password: 'qwerty12345!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 404 Not Found error if user with provided email does not exist', async (): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: notCreatedUser.email, password: passwordMock });

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});

		it('should return 400 Bad Request error if provided password is not correct', async (): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: createdUser.email, password: 'incorrectPassword123' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 200 OK status if user was logged in', async (): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			expect(response.status).toBe(HttpStatus.OK);
		});

		it('should trim all whitespaces in payload string values', async (): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: `   ${createdUser.email}   `, password: `   ${passwordMock}   ` });

			expect(response.status).toBe(HttpStatus.OK);
		});

		it('should return generated access token in response body data', async (): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			expect(
				(response.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken,
			).toBeDefined();
		});

		it('should save generated refresh token in cookies', async (): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const cookies: string[] = response.get(Headers.SET_COOKIE) || [];

			expect(
				cookies.some((cookie: string) => cookie.startsWith(`${CookiesNames.REFRESH_TOKEN}=`)),
			).toBe(true);
		});
	});
});
