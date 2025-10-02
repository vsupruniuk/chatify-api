import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import * as supertest from 'supertest';
import { DataSource } from 'typeorm';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { AccountSettings, PasswordResetToken, User } from '@entities';

import { users, accountSettings, passwordResetTokens } from '@testMocks';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

describe('Reset password', (): void => {
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

	describe('PATCH /auth/reset-password', (): void => {
		const createdUser: User = users[4];
		const createdAccountSettings: AccountSettings = accountSettings[4];
		const createdPasswordResetToken: PasswordResetToken = passwordResetTokens[4];

		const notCreatedUser: User = users[1];

		beforeEach(async (): Promise<void> => {
			const passwordResetToken: PasswordResetToken = dataSource
				.getRepository(PasswordResetToken)
				.create(createdPasswordResetToken);
			const accountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(createdAccountSettings);

			const user: User = dataSource
				.getRepository(User)
				.create({ ...createdUser, accountSettings, passwordResetToken });

			await dataSource.getRepository(PasswordResetToken).save([passwordResetToken]);
			await dataSource.getRepository(AccountSettings).save([accountSettings]);

			await dataSource.getRepository(User).save([user]);
		});

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);
		});

		it('should return 400 Bad Request error if email is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/reset-password')
				.send({});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/reset-password')
				.send({ email: 123456 });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is not valid', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/reset-password')
				.send({ email: 't.odinson' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/reset-password')
				.send({ email: createdUser.email.padStart(256, 't') });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 404 Not Found error if user with this email was not found', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/reset-password')
				.send({ email: notCreatedUser.email });

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});

		it('should return 200 OK status if password reset token was generated and sent', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/reset-password')
				.send({ email: createdUser.email });

			expect(response.status).toBe(HttpStatus.OK);
		});

		it('should return null body data if password reset token was generated and sent', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/reset-password')
				.send({ email: createdUser.email });

			expect((response.body as SuccessfulResponseResult).data).toBeNull();
		});
	});
});
