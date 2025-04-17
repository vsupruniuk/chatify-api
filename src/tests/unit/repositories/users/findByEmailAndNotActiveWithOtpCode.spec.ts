import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { UsersRepository } from '@repositories/users/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';

describe('Users repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let usersRepository: UsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, UsersRepository],
		}).compile();

		usersRepository = moduleFixture.get(UsersRepository);
	});

	describe('Find by email and not active with OTP code', (): void => {
		const expectedUser: User = users[7];

		const emailMock: string = expectedUser.email;

		beforeEach((): void => {
			queryBuilderMock.getOne.mockReturnValue(expectedUser);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', async (): Promise<void> => {
			expect(usersRepository.findByEmailAndNotActiveWithOtpCode).toBeDefined();
		});

		it('should be a function', async (): Promise<void> => {
			expect(usersRepository.findByEmailAndNotActiveWithOtpCode).toBeInstanceOf(Function);
		});

		it('should use query builder and create a query for searching a not activated user with OTP code by email', async (): Promise<void> => {
			await usersRepository.findByEmailAndNotActiveWithOtpCode(emailMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'user.otpCode',
				'otpCode',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'user.email = :email', {
				email: emailMock,
			});

			expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(
				1,
				'user.isActivated = :isActivated',
				{ isActivated: false },
			);

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should return a user if it was found', async (): Promise<void> => {
			const user: User | null = await usersRepository.findByEmailAndNotActiveWithOtpCode(emailMock);

			expect(user).toEqual(expectedUser);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const user: User | null = await usersRepository.findByEmailAndNotActiveWithOtpCode(emailMock);

			expect(user).toBeNull();
		});
	});
});
