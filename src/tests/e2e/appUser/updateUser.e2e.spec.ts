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
import { AppUserDto } from '@dtos/appUser/AppUser.dto';

describe('Update user', (): void => {
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

	describe('PATCH /app-user', (): void => {
		const passwordMock: string = 'Qwerty12345!';
		const createdUser: User = users[0];
		const existingUser: User = users[1];

		const aboutMock: string = 'The mightiest avenger';
		const firstNameMock: string = 'Thor';
		const lastNameMock: string = 'Odinson';
		const nicknameMock: string = 't.odinson';

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
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: nicknameMock,
				});

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided empty authorization header', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: nicknameMock,
				})
				.set(Headers.AUTHORIZATION, '');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header without access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: nicknameMock,
				})
				.set(Headers.AUTHORIZATION, 'Bearer');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 Unauthorized error if user provided authorization header with invalid access token', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: nicknameMock,
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
				.patch('/app-user')
				.send({})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if about present in body but it is not a string', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: 72,
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: nicknameMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if about present in body but it is more than 255 characters long', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: 'Iron man'.padEnd(256, 'n'),
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: nicknameMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if first name present in body but it is not a string', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: 123,
					lastName: lastNameMock,
					nickname: nicknameMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if first name present in body but it is less than 3 characters long', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: 'Th',
					lastName: lastNameMock,
					nickname: nicknameMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if first name present in body but it is more than 255 characters long', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock.padEnd(256, 'r'),
					lastName: lastNameMock,
					nickname: nicknameMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if last name present in body but it is not a string', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: 12345,
					nickname: nicknameMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if last name present in body but it is less than 3 characters long', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: 'Od',
					nickname: nicknameMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if last name present in body but it is more than 255 characters long', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: lastNameMock.padEnd(256, 'n'),
					nickname: nicknameMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if nickname present in body but it is not a string', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: 12345,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if nickname present in body but it is less than 3 characters long', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: 'th',
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if nickname present in body but it is more than 255 characters long', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: nicknameMock.padEnd(256, 'n'),
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 409 Conflict error if user trying to change nickname to already taken', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			await agent.post('/auth/signup').send({
				email: existingUser.email,
				firstName: existingUser.firstName,
				lastName: existingUser.lastName,
				nickname: existingUser.nickname,
				password: passwordMock,
				passwordConfirmation: passwordMock,
			});

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: existingUser.nickname,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.CONFLICT);
		});

		it('should return 200 OK status if user data were successfully updated', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: nicknameMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			expect(updateAppUserResponse.status).toBe(HttpStatus.OK);
		});

		it('should return updated user data in response body data', async (): Promise<void> => {
			const agent = supertest.agent(app.getHttpServer());

			const loginResponse: supertest.Response = await agent
				.post('/auth/login')
				.send({ email: createdUser.email, password: passwordMock });

			const updateAppUserResponse: supertest.Response = await agent
				.patch('/app-user')
				.send({
					about: aboutMock,
					firstName: firstNameMock,
					lastName: lastNameMock,
					nickname: nicknameMock,
				})
				.set(
					Headers.AUTHORIZATION,
					`Bearer ${(loginResponse.body as SuccessfulResponseResult<LoginResponseDto>).data.accessToken}`,
				);

			const userData: AppUserDto = (
				updateAppUserResponse.body as SuccessfulResponseResult<AppUserDto>
			).data;

			expect(userData.about).toBe(aboutMock);
			expect(userData.firstName).toBe(firstNameMock);
			expect(userData.lastName).toBe(lastNameMock);
			expect(userData.nickname).toBe(nicknameMock);
		});
	});
});
