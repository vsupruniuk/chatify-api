import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as supertest from 'supertest';
import * as dayjs from 'dayjs';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { AccountSettings, PasswordResetToken, User } from '@entities';

import { users, accountSettings, passwordResetTokens } from '@testMocks';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

describe('Reset password confirmation', (): void => {
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

	describe('PATCH /auth/reset-password/:passwordResetToken', (): void => {
		const createdUser: User = users[1];
		const createdAccountSettings: AccountSettings = accountSettings[1];
		const createdPasswordResetToken: PasswordResetToken = passwordResetTokens[1];

		const notCreatedPasswordResetToken: PasswordResetToken = passwordResetTokens[2];

		beforeEach(async (): Promise<void> => {
			jest.useFakeTimers({ advanceTimers: true });

			const passwordResetToken: PasswordResetToken = dataSource
				.getRepository(PasswordResetToken)
				.create(createdPasswordResetToken);
			const accountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(createdAccountSettings);

			const user: User = dataSource
				.getRepository(User)
				.create({ ...createdUser, accountSettings, passwordResetToken });

			await dataSource.getRepository(AccountSettings).save([accountSettings]);
			await dataSource.getRepository(PasswordResetToken).save([passwordResetToken]);

			await dataSource.getRepository(User).save([user]);
		});

		afterEach(async (): Promise<void> => {
			jest.useRealTimers();

			await dataSource.synchronize(true);
		});

		it('should return 400 Bad Request error if password is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ passwordConfirmation: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 1234, passwordConfirmation: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password is less then 6 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwert', passwordConfirmation: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password is more then 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty12345!'.padEnd(256, '!'), passwordConfirmation: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password does not contains at least 1 number', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty!', passwordConfirmation: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password does not contains at least uppercase letter', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'qwerty12345!', passwordConfirmation: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty12345!', passwordConfirmation: 1234 });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation is less than 6 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty12345!', passwordConfirmation: 'Qwert' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation is more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty12345!', passwordConfirmation: 'Qwerty12345!'.padEnd(256, '!') });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation does not contains at least 1 number', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty12345!', passwordConfirmation: 'Qwerty!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password confirmation does not contains at least 1 uppercase letter', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty12345!', passwordConfirmation: 'qwerty12345!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password and password confirmation does not match', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty1234!', passwordConfirmation: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if password reset token in path is not valid uuid string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/reset-password/passwordResetToken')
				.send({ password: 'Qwerty12345!', passwordConfirmation: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 404 Not Found error if password reset token does not exist', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${notCreatedPasswordResetToken.token}`)
				.send({ password: 'Qwerty12345!', passwordConfirmation: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});

		it('should return 404 Not Found error if password reset token exist but expired', async (): Promise<void> => {
			jest.setSystemTime(dayjs(createdPasswordResetToken.expiresAt).add(10, 'minutes').toDate());

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty12345!', passwordConfirmation: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});

		it('should return 200 OK status if password was changed', async (): Promise<void> => {
			jest.setSystemTime(
				dayjs(createdPasswordResetToken.expiresAt).subtract(10, 'minutes').toDate(),
			);

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty12345!', passwordConfirmation: 'Qwerty12345!' });

			expect(response.status).toBe(HttpStatus.OK);
		});

		it('should trim all whitespaces in payload string values', async (): Promise<void> => {
			jest.setSystemTime(
				dayjs(createdPasswordResetToken.expiresAt).subtract(10, 'minutes').toDate(),
			);

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: '   Qwerty12345!   ', passwordConfirmation: '   Qwerty12345!   ' });

			expect(response.status).toBe(HttpStatus.OK);
		});

		it('should return null in response body data if password was changed', async (): Promise<void> => {
			jest.setSystemTime(
				dayjs(createdPasswordResetToken.expiresAt).subtract(10, 'minutes').toDate(),
			);

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(`/auth/reset-password/${createdPasswordResetToken.token}`)
				.send({ password: 'Qwerty12345!', passwordConfirmation: 'Qwerty12345!' });

			expect((response.body as SuccessfulResponseResult).data).toBeNull();
		});
	});
});
