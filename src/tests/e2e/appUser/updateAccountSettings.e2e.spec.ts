import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import * as cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';
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
import { AccountSettingsDto } from '@dtos/accountSettings/accountSettings';

describe('Update account settings', (): void => {
	let app: INestApplication;
	let postgresContainer: StartedTestContainer;
	let dataSource: DataSource;

	const route: string = `/${Route.APP_USER}/${Route.ACCOUNT_SETTINGS}`;

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

	describe(`PATCH ${route}`, (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[0];

		const enterIsSendingMock: boolean = true;
		const notificationMock: boolean = true;
		const twoStepVerificationMock: boolean = true;

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
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(route)
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
				.patch(route)
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(Header.AUTHORIZATION, '');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header without access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(route)
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(Header.AUTHORIZATION, 'Bearer');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header with invalid access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(route)
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(Header.AUTHORIZATION, 'Bearer invalidAccessToken');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 400 Bad Request error if empty body was sent', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken = await login(agent);

			const updateAppUserResponse: supertest.Response = await agent
				.patch(route)
				.send({})
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if enter is sending is present but it is not a boolean', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken = await login(agent);

			const updateAppUserResponse: supertest.Response = await agent
				.patch(route)
				.send({
					enterIsSending: 'true',
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if notification is present but it is not a boolean', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken = await login(agent);

			const updateAppUserResponse: supertest.Response = await agent
				.patch(route)
				.send({
					enterIsSending: enterIsSendingMock,
					notification: 'true',
					twoStepVerification: twoStepVerificationMock,
				})
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if two step verification is present but it is not a boolean', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken = await login(agent);

			const updateAppUserResponse: supertest.Response = await agent
				.patch(route)
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: 'true',
				})
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 200 OK status if account settings were successfully updated', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken = await login(agent);

			const updateAppUserResponse: supertest.Response = await agent
				.patch(route)
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(updateAppUserResponse.status).toBe(HttpStatus.OK);
		});

		it('should return updated account settings in response body data', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken = await login(agent);

			const updateAppUserResponse: supertest.Response = await agent
				.patch(route)
				.send({
					enterIsSending: enterIsSendingMock,
					notification: notificationMock,
					twoStepVerification: twoStepVerificationMock,
				})
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			const updatedSettings: AccountSettingsDto = (
				updateAppUserResponse.body as SuccessfulResponseResult<AccountSettingsDto>
			).data;

			expect(updatedSettings.enterIsSending).toBe(true);
			expect(updatedSettings.notification).toBe(true);
			expect(updatedSettings.twoStepVerification).toBe(true);
		});
	});
});
