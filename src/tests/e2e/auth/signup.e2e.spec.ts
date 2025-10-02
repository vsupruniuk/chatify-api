import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as supertest from 'supertest';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { TestDatabaseHelper } from '@testHelpers';

import { AccountSettings, User } from '@entities';

import { users, accountSettings } from '@testMocks';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

describe('Signup', (): void => {
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

	describe('POST /auth/signup', (): void => {
		const existingUser: User = users[2];
		const existingAccountSettings: AccountSettings = accountSettings[0];

		const notExistingUser: User = users[0];

		beforeEach(async (): Promise<void> => {
			const accountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(existingAccountSettings);
			const user: User = dataSource
				.getRepository(User)
				.create({ ...existingUser, accountSettings });

			await dataSource.getRepository(AccountSettings).save([accountSettings]);
			await dataSource.getRepository(User).save([user]);
		});

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);
		});

		it('should return 400 Bad Request error if email is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is not valid', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: 'wrong.email',
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email.padStart(256, 't'),
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: 1234,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if nickname is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if nickname is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: 1234,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if nickname is less than 3 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: 'st',
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if nickname is more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname.padEnd(256, 'k'),
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if first name is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if first name is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: 1234,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if first name is less than 3 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: 'To',
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if first name is more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName.padEnd(256, 'k'),
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if last name present but it is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: 1234,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if last name present but less than 3 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: 'St',
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if last name present but more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName?.padEnd(256, 'k'),
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 1234,
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password is less than 6 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwert',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password is more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!'.padEnd(256, '!'),
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password does not include at least 1 number', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password does not include at least 1 upper case letter', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 1234,
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation is less than 6 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwert',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation is more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!'.padEnd(256, '!'),
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation does not include at least 1 number', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation does not include at least 1 uppercase letter', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password and password confirmation valid but does not match', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'QQwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 409 Conflict error if user with the same email already exist', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: existingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.CONFLICT);
		});

		it('should return 409 Conflict error if user with the same nickname already exist', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: existingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.CONFLICT);
		});

		it('should create user and return 201 Created status if request body is valid and no conflicts in data', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.CREATED);
		});

		it('should create user and return 201 Created status if last name is not provided', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.CREATED);
		});

		it('should return null in response body data', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: notExistingUser.email,
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect((response.body as SuccessfulResponseResult).data).toBeNull();
		});
	});
});
