import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import * as supertest from 'supertest';
import * as cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';
import * as path from 'node:path';
import * as fs from 'node:fs';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { User } from '@entities';

import { users } from '@testMocks';

import { Header, FileField, Route } from '@enums';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

import { LoginResponseDto } from '@dtos/auth/login';
import { UserWithAccountSettingsDto } from '@dtos/users';

describe('Delete avatar', (): void => {
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

	describe(`DELETE ${route}`, (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[3];

		const imagePath: string = path.join(__dirname, '..', '..', 'files', 'user.png');

		const login = async (agent: ReturnType<typeof supertest.agent>): Promise<string> => {
			const loginResponse: supertest.Response = await agent
				.post(`/${Route.AUTH}/${Route.LOGIN}`)
				.send({ email: createdUser.email, password: passwordMock });

			return (loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken;
		};

		const createAvatar = async (
			agent: ReturnType<typeof supertest.agent>,
			accessToken: string,
		): Promise<void> => {
			await agent
				.post(route)
				.attach(FileField.USER_AVATAR, imagePath)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);
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
			const response: supertest.Response = await supertest.agent(app.getHttpServer()).delete(route);

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided empty authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.delete(route)
				.set(Header.AUTHORIZATION, '');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header without access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.delete(route)
				.set(Header.AUTHORIZATION, 'Bearer');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header with invalid access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.delete(route)
				.set(Header.AUTHORIZATION, 'Bearer accessToken');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 400 Bad Request error if user does not have an avatar', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);

			const deleteAvatarResponse: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.delete(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(deleteAvatarResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 204 No Content status if user avatar was deleted', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);
			await createAvatar(agent, accessToken);

			const deleteAvatarResponse: supertest.Response = await agent
				.delete(route)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			expect(deleteAvatarResponse.status).toBe(HttpStatus.NO_CONTENT);
		});

		it('should set null to user avatar in DB', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const accessToken: string = await login(agent);
			await createAvatar(agent, accessToken);

			await agent.delete(route).set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			const appUserResponse: supertest.Response = await agent
				.get(`/${Route.APP_USER}`)
				.set(Header.AUTHORIZATION, `Bearer ${accessToken}`);

			const appUserAvatar: string | null = (
				appUserResponse.body as SuccessfulResponseResult<UserWithAccountSettingsDto>
			).data.avatarUrl;

			expect(appUserAvatar).toBeNull();
		});
	});
});
