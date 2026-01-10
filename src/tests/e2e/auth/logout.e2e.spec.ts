import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as supertest from 'supertest';
import * as cookieParser from 'cookie-parser';

import { TestDatabaseHelper } from '@testHelpers';

import { AppModule } from '@modules';

import { validationPipeConfig } from '@configs';

import { GlobalExceptionFilter } from '@filters';

import { User } from '@entities';

import { users } from '@testMocks';

import { Header, CookiesName, Route } from '@enums';

describe('Logout', (): void => {
	let app: INestApplication;
	let postgresContainer: StartedTestContainer;
	let dataSource: DataSource;

	const route: string = `/${Route.AUTH}/${Route.LOGOUT}`;

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
		const createdUser: User = users[5];

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

		it('should return 204 No Content status if user is not logged in', async (): Promise<void> => {
			const response: supertest.Response = await supertest.agent(app.getHttpServer()).patch(route);

			expect(response.status).toBe(HttpStatus.NO_CONTENT);
		});

		it('should return 204 No Content status if user logged in', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await signupAndLogin(agent);

			const response: supertest.Response = await agent.patch(route);

			expect(response.status).toBe(HttpStatus.NO_CONTENT);
		});

		it('should remove refresh token from user cookies', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await signupAndLogin(agent);

			const response: supertest.Response = await agent.patch(route);

			const refreshTokenCookie: string | undefined = (response.get(Header.SET_COOKIE) || []).find(
				(cookie: string) => cookie.startsWith(`${CookiesName.REFRESH_TOKEN}=`),
			);

			expect(refreshTokenCookie).toMatch(/Expires=\s*Thu,\s*01 Jan 1970 00:00:00 GMT/i);
		});
	});
});
