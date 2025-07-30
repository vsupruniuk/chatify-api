import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@modules/app.module';
import { StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import * as supertest from 'supertest';
import { validationPipeConfig } from '@configs/validationPipe.config';
import { GlobalExceptionFilter } from '@filters/globalException.filter';
import { TestDatabaseHelper } from '@testHelpers/TestDatabase.helper';
import { User } from '@db/entities';
import { users } from '@testMocks/User/users';

describe('Signup', (): void => {
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

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await dataSource.destroy();
		await postgresContainer.stop();
		await app.close();
	});

	describe('POST /auth/signup', (): void => {
		// const existingUser: User = users[2];
		// const existingUserAccountSettings: AccountSettings = accountSettings[0];

		const notExistingUser: User = users[1];

		it('should return 400 Bad Request error if email is missed', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 Bad Request error if email is not valid', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: 'wrong.email',
					nickname: notExistingUser.nickname,
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
					password: 'Qwerty12345!',
					passwordConfirmation: 'Qwerty12345!',
				});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('should fail', async (): Promise<void> => {
			const response: supertest.Response = await supertest
				.agent(app.getHttpServer())
				.post('/auth/signup')
				.send({
					firstName: notExistingUser.firstName,
					lastName: notExistingUser.lastName,
				});

			expect(response.status).toBe(HttpStatus.CREATED);
		});
	});
});
