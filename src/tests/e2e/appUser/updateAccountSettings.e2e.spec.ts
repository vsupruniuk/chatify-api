import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { TestDatabaseHelper } from '@testHelpers/TestDatabase.helper';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@modules/app.module';
import { validationPipeConfig } from '@configs/validationPipe.config';
import { GlobalExceptionFilter } from '@filters/globalException.filter';
import * as cookieParser from 'cookie-parser';
import { User } from '@db/entities';
import { users } from '@testMocks/User/users';
import * as supertest from 'supertest';
import { Headers } from '@enums/Headers.enum';
import { SuccessfulResponseResult } from '@responses/successfulResponses/SuccessfulResponseResult';
import { LoginResponseDto } from '@dtos/auth/login/LoginResponse.dto';
import { AccountSettingsDto } from '@dtos/accountSettings/accountSettings/AccountSettings.dto';

describe('Update account settings', (): void => {
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

	describe('PATCH /app-user/account-settings', (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[0];

		const enterIsSendingMock: boolean = true;
		const notificationMock: boolean = true;
		const twoStepVerificationMock: boolean = true;

		beforeEach(async (): Promise<void> => {
			await supertest.agent(app.getHttpServer()).post('/auth/signup').send({
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
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/app-user/account-settings')
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				});

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided empty authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/app-user/account-settings')
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(Headers.AUTHORIZATION, '');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header without access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/app-user/account-settings')
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(Headers.AUTHORIZATION, 'Bearer');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header with invalid access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/app-user/account-settings')
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(Headers.AUTHORIZATION, 'Bearer accessToken');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 400 Bad Request error if empty body was sent', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user/account-settings')
				.send({})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if enter is sending is present but it is not a boolean', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user/account-settings')
				.send({
					enterIsSending: 'true',
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if notification is present but it is not a boolean', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user/account-settings')
				.send({
					enterIsSending: enterIsSendingMock,
					notification: 'true',
					twoStepVerification: twoStepVerificationMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if two step verification is present but it is not a boolean', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user/account-settings')
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: 'true',
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 200 OK status if account settings were successfully updated', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user/account-settings')
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.OK);
		});

		it('should return updated account settings in response body data', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user/account-settings')
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			const updatedSettings: AccountSettingsDto = (
				updateAppUserResponse.body as SuccessfulResponseResult<AccountSettingsDto>
			).data;

			expect(updatedSettings.enterIsSending).toBe(true);
			expect(updatedSettings.notification).toBe(true);
			expect(updatedSettings.twoStepVerification).toBe(true);
		});
	});
});
