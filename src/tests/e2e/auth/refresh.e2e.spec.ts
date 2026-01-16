import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';
import * as supertest from 'supertest';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { User } from '@entities';

import { users } from '@testMocks';

import { CookiesName, Header, Route } from '@enums';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

import { LoginResponseDto } from '@dtos/auth/login';

describe('Refresh', (): void => {
	let app: INestApplication;
	let postgresContainer: StartedTestContainer;
	let dataSource: DataSource;

	const route: string = `/${Route.AUTH}/${Route.REFRESH}`;

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
		const createdUser: User = users[7];

		const signupAndLogin = async (agent: ReturnType<typeof supertest.agent>): Promise<void> => {
			await agent.post(`/${Route.AUTH}/${Route.SIGNUP}`).send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			await agent
				.post(`/${Route.AUTH}/${Route.LOGIN}`)
				.send({ email: createdUser.email, password: passwordMock });
		};

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);
		});

		it('should return 401 Unauthorized error if user does not have refresh token cookie', async (): Promise<void> => {
			const response: supertest.Response = await supertest.agent(app.getHttpServer()).patch(route);

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user have refresh token cookie but without refresh token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(route)
				.set('Cookie', [`${CookiesName.REFRESH_TOKEN}=`]);

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user have refresh token cookie with invalid refresh token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch(route)
				.set('Cookie', [`${CookiesName.REFRESH_TOKEN}=refreshToken`]);

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 200 OK status if refresh and access token were changed', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await signupAndLogin(agent);

			const response: supertest.Response = await agent.patch(route);

			expect(response.status).toBe(HttpStatus.OK);
		});

		it('should return new access token in response body data', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await signupAndLogin(agent);

			const response: supertest.Response = await agent.patch(route);

			expect(
				(response.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken,
			).toBeDefined();
		});

		it('should save new refresh token in user cookies', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await signupAndLogin(agent);

			const response: supertest.Response = await agent.patch(route);

			const cookies: string[] = response.get(Header.SET_COOKIE) || [];

			expect(
				cookies.some((cookie: string) => cookie.startsWith(`${CookiesName.REFRESH_TOKEN}=`)),
			).toBe(true);
		});
	});
});
