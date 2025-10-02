import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as path from 'node:path';
import * as cookieParser from 'cookie-parser';
import * as fs from 'node:fs';
import * as supertest from 'supertest';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { User } from '@entities';

import { users } from '@testMocks';

import { Headers, FileFields, ContentTypes } from '@enums';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

import { LoginResponseDto } from '@dtos/auth/login';
import { UploadAvatarResponseDto } from '@dtos/accountSettings/userAvatar';

describe('Get file', (): void => {
	let app: INestApplication;
	let postgresContainer: StartedTestContainer;
	let dataSource: DataSource;

	const publicDir: string = path.join(process.cwd(), 'public');

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

		fs.mkdirSync(publicDir, { recursive: true });
	});

	afterAll(async (): Promise<void> => {
		await dataSource.destroy();
		await postgresContainer.stop();
		await app.close();

		fs.rmSync(publicDir, { recursive: true });
	});

	describe('GET /static/file-name', (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[4];

		const imagePath: string = path.join(__dirname, '..', '..', 'files', 'user.png');

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
				.get('/static/user.png');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided empty authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/static/user.png')
				.set(Headers.AUTHORIZATION, '');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header without access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/static/user.png')
				.set(Headers.AUTHORIZATION, 'Bearer');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header with invalid access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.get('/static/user.png')
				.set(Headers.AUTHORIZATION, 'Bearer accessToken');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 404 Not Found error if file not exist', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const imageResponse = await agent
				.get('/static/not-exist.png')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(imageResponse.status).toBe(HttpStatus.NOT_FOUND);
		});

		it('should return 404 Not Found error on path traversal', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const imageResponse = await agent
				.get('/static/../../not-exist.png')
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(imageResponse.status).toBe(HttpStatus.NOT_FOUND);
		});

		it('should return 200 OK status if file exist', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const uploadAvatarResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/app-user/user-avatar')
				.attach(FileFields.USER_AVATAR, imagePath)
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			const imageUrl: string = (
				uploadAvatarResponse.body as SuccessfulResponseResult<UploadAvatarResponseDto>
			).data.avatarUrl;

			const imageResponse = await agent
				.get(`/static/${imageUrl}`)
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(imageResponse.status).toBe(HttpStatus.OK);
		});

		it('should return response as streamable file of type image', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const uploadAvatarResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/app-user/user-avatar')
				.attach(FileFields.USER_AVATAR, imagePath)
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			const imageUrl: string = (
				uploadAvatarResponse.body as SuccessfulResponseResult<UploadAvatarResponseDto>
			).data.avatarUrl;

			const imageResponse = await agent
				.get(`/static/${imageUrl}`)
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(imageResponse.headers[Headers.CONTENT_TYPE]).toBe(ContentTypes.IMAGE_JPEG);
		});
	});
});
