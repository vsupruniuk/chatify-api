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

import { AccountSettings, JWTToken, OTPCode, User } from '@entities';

import { users, accountSettings, otpCodes, jwtTokens } from '@testMocks';

import { ActivateAccountResponseDto } from '@dtos/auth/accountActivation';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

import { Headers, CookiesNames } from '@enums';

describe('Activate account', (): void => {
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

	describe('PATCH /auth/activate-account', (): void => {
		const createdUser: User = users[2];
		const createdAccountSettings: AccountSettings = accountSettings[2];
		const createdOtpCode: OTPCode = otpCodes[2];
		const createdJwtToken: JWTToken = jwtTokens[2];

		const notCreatedUser: User = users[3];

		beforeEach(async (): Promise<void> => {
			jest.useFakeTimers({ advanceTimers: true });

			const otpCode: OTPCode = dataSource.getRepository(OTPCode).create(createdOtpCode);
			const accountSettings: AccountSettings = dataSource
				.getRepository(AccountSettings)
				.create(createdAccountSettings);
			const jwtToken: JWTToken = dataSource.getRepository(JWTToken).create(createdJwtToken);

			const user: User = dataSource
				.getRepository(User)
				.create({ ...createdUser, isActivated: false, accountSettings, otpCode, jwtToken });

			await dataSource.getRepository(OTPCode).save([otpCode]);
			await dataSource.getRepository(AccountSettings).save([accountSettings]);
			await dataSource.getRepository(JWTToken).save([jwtToken]);

			await dataSource.getRepository(User).save([user]);
		});

		afterEach(async (): Promise<void> => {
			jest.useRealTimers();

			await dataSource.synchronize(true);
		});

		it('should return 400 Bad Request error if email is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ code: createdOtpCode.code });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is not a string', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: 123, code: createdOtpCode.code });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is not valid', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: 't.odinson', code: createdOtpCode.code });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is more than 255 characters long', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: createdUser.email.padStart(256, 't'), code: createdOtpCode.code });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if code is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: createdUser.email });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if code is not a number', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: createdUser.email, code: '123456' });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if code is less than 100000 (not a 6-digit number)', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: createdUser.email, code: 99999 });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if code is greater than 999999 (not a 6-digit number)', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: createdUser.email, code: 1000000 });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 404 Not Found error if user with provided email and OTP code not found', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: notCreatedUser.email, code: createdOtpCode.code });

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});

		it('should return 400 Bad Request error if user with provided email and OTP code found but code is not correct', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: createdUser.email, code: <number>createdOtpCode.code - 1 });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if user OTP code correct but expired', async (): Promise<void> => {
			jest.setSystemTime(dayjs(createdOtpCode.expiresAt).add(10, 'minutes').toDate());

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: createdUser.email, code: <number>createdOtpCode.code });

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 200 OK status if user was activated', async (): Promise<void> => {
			jest.setSystemTime(dayjs(createdOtpCode.expiresAt).subtract(10, 'minutes').toDate());

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: createdUser.email, code: <number>createdOtpCode.code });

			expect(response.status).toBe(HttpStatus.OK);
		});

		it('should trim all whitespaces in payload string values', async (): Promise<void> => {
			jest.setSystemTime(dayjs(createdOtpCode.expiresAt).subtract(10, 'minutes').toDate());

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: `   ${createdUser.email}   `, code: <number>createdOtpCode.code });

			console.log(response.body);

			expect(response.status).toBe(HttpStatus.OK);
		});

		it('should return generated access token if user was activated', async (): Promise<void> => {
			jest.setSystemTime(dayjs(createdOtpCode.expiresAt).subtract(10, 'minutes').toDate());

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: createdUser.email, code: <number>createdOtpCode.code });

			expect(
				(response.body as SuccessfulResponseResult<ActivateAccountResponseDto>).data.accessToken,
			).toBeDefined();
		});

		it('should return save refresh token to user cookies', async (): Promise<void> => {
			jest.setSystemTime(dayjs(createdOtpCode.expiresAt).subtract(10, 'minutes').toDate());

			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/activate-account')
				.send({ email: createdUser.email, code: <number>createdOtpCode.code });

			const cookies: string[] = response.get(Headers.SET_COOKIE) || [];

			expect(
				cookies.some((cookie: string) => cookie.startsWith(`${CookiesNames.REFRESH_TOKEN}=`)),
			).toBe(true);
		});
	});
});
