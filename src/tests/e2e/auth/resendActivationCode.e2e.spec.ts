import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as supertest from 'supertest';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { AccountSettings, OTPCode, User } from '@entities';

import { users, accountSettings, otpCodes } from '@testMocks';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

describe('Resend activation code', (): void => {
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

	describe('PATCH /auth/resend-activation-code', (): void => {
		const createdUser: User = users[3];
		const createdAccountSettings: AccountSettings = accountSettings[3];
		const createdOtpCode: OTPCode = otpCodes[3];

		const notCreatedUser: User = users[0];

		beforeEach(async (): Promise<void> => {
			const otpCode: OTPCode = dataSource.getRepository(OTPCode).create(createdOtpCode);
			const accountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(createdAccountSettings);

			const user: User = dataSource
				.getRepository(User)
				.create({ ...createdUser, isActivated: false, accountSettings, otpCode });

			await dataSource.getRepository(OTPCode).save([otpCode]);
			await dataSource.getRepository(AccountSettings).save([accountSettings]);

			await dataSource.getRepository(User).save([user]);
		});

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);
		});

		it('should return 400 Bad Request error if email is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/resend-activation-code')
				.send({});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/resend-activation-code')
				.send({ email: 123456 });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is not valid', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/resend-activation-code')
				.send({ email: 't.odinson' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/resend-activation-code')
				.send({ email: createdUser.email.padStart(256, 't') });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 404 Not Found error if user with this email was not found', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/resend-activation-code')
				.send({ email: notCreatedUser.email });

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});

		it('should return 200 OK status if new activation code was generated and sent', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/resend-activation-code')
				.send({ email: createdUser.email });

			expect(response.status).toBe(HttpStatus.OK);
		});

		it('should return null in response data if new activation code was generated and sent', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/resend-activation-code')
				.send({ email: createdUser.email });

			expect((response.body as SuccessfulResponseResult).data).toBeNull();
		});
	});
});
