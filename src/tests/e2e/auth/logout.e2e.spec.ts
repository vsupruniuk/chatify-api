import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { TestDatabaseHelper } from '@testHelpers/TestDatabase.helper';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@modules/app.module';
import { validationPipeConfig } from '@configs/validationPipe.config';
import { GlobalExceptionFilter } from '@filters/globalException.filter';
import { User } from '@db/entities';
import { users } from '@testMocks/User/users';
import * as supertest from 'supertest';
import * as cookieParser from 'cookie-parser';
import { Headers } from '@enums/Headers.enum';
import { CookiesNames } from '@enums/CookiesNames.enum';

describe('Logout', (): void => {
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

	describe('PATCH /auth/logout', (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[5];

		afterEach(async (): Promise<void> => {
			await dataSource.synchronize(true);
		});

		it('should return 204 No Content status if user is not logged in', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/auth/logout');

			expect(response.status).toBe(HttpStatus.NO_CONTENT);
		});

		it('should return 204 No Content status if user logged in', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await agent.post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			await agent.post('/auth/login').send({ email: createdUser.email, password: passwordMock });

			const response: supertest.Response = await agent.patch('/auth/logout');

			expect(response.status).toBe(HttpStatus.NO_CONTENT);
		});

		it('should remove refresh token from user cookies', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await agent.post('/auth/signup').send({
				email: createdUser.email,
				firstName: createdUser.firstName,
				lastName: createdUser.lastName,
				nickname: createdUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			await agent.post('/auth/login').send({ email: createdUser.email, password: passwordMock });

			const response: supertest.Response = await agent.patch('/auth/logout');

			const refreshTokenCookie: string | undefined = (response.get(Headers.SET_COOKIE) || []).find(
				(cookie: string) => cookie.startsWith(`${CookiesNames.REFRESH_TOKEN}=`),
			);

			expect(refreshTokenCookie).toMatch(/Expires=\s*Thu,\s*01 Jan 1970 00:00:00 GMT/i);
		});
	});
});
