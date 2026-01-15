import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';
import * as supertest from 'supertest';
import * as path from 'node:path';
import * as fs from 'node:fs';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { filesConfig, validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { User } from '@entities';

import { users } from '@testMocks';

import { Header, FileField, Route } from '@enums';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

import { LoginResponseDto } from '@dtos/auth/login';
import { UploadAvatarResponseDto } from '@dtos/accountSettings/userAvatar';
import { UserWithAccountSettingsDto } from '@dtos/users';

describe('Upload avatar', (): void => {
	let app: INestApplication;
	let postgresContainer: StartedTestContainer;
	let dataSource: DataSource;

	const publicDir: string = path.join(process.cwd(), 'public');
	const route: string = `/${Route.APP_USER}/${Route.USER_AVATAR}`;

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

		fs.mkdirSync(publicDir, { recursive: true });
	});

	afterAll(async (): Promise<void> => {
		await dataSource.destroy();
		await postgresContainer.stop();
		await app.close();

		fs.rmSync(publicDir, { recursive: true });
	});

	describe(`POST ${route}`, (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[1];

		const validImagePath: string = path.join(__dirname, '..', '..', 'files', 'user.png');
		const invalidImagePath: string = path.join(__dirname, '..', '..', 'files', 'user.txt');

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
			const response: supertest.Response = await supertest.agent(app.getHttpServer()).post(route);

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided empty authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post(route)
				.set(Header.AUTHORIZATION, '');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header without access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post(route)
				.set(Header.AUTHORIZATION, 'Bearer');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header with invalid access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post(route)
				.set(Header.AUTHORIZATION, 'Bearer accessToken');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 400 Bad Request error if file extension is not acceptable', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const userAvatarResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post(route)
				.attach(FileField.USER_AVATAR, invalidImagePath)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(userAvatarResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 413 Payload Too Larger error if file size is more than 10 MB', async (): Promise<void> => {
			const largeFile = Buffer.alloc(filesConfig[FileField.USER_AVATAR].fileSize + 100);
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const userAvatarResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post(route)
				.attach(FileField.USER_AVATAR, largeFile, 'avatar.png')
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(userAvatarResponse.status).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
		});

		it('should return 201 Created status if file valid and was saved', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const userAvatarResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post(route)
				.attach(FileField.USER_AVATAR, validImagePath)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(userAvatarResponse.status).toBe(HttpStatus.CREATED);
		});

		it('should return new user avatar url in response body data', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const userAvatarResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post(route)
				.attach(FileField.USER_AVATAR, validImagePath)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			const responseData: UploadAvatarResponseDto = (
				userAvatarResponse.body as SuccessfulResponseResult<UploadAvatarResponseDto>
			).data;

			expect(responseData.avatarUrl.length > 0).toBe(true);
		});

		it('should save user avatar file name in DB', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			await supertest
				.agent(app.getHttpServer())
				.post(route)
				.attach(FileField.USER_AVATAR, validImagePath)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			const appUserResponse: supertest.Response = await agent
				.get(`/${Route.APP_USER}`)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			const appUserAvatar: string | null = (
				appUserResponse.body as SuccessfulResponseResult<UserWithAccountSettingsDto>
			).data.avatarUrl;

			expect(appUserAvatar).not.toBeNull();
		});
	});
});
