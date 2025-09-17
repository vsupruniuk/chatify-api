import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { UsersRepository } from '@repositories/users/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { Brackets, DataSource, WhereExpressionBuilder } from 'typeorm';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { passwordResetTokens } from '@testMocks/PasswordResetToken/passwordResetTokens';

describe('Users repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let usersRepository: UsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, UsersRepository],
		}).compile();

		usersRepository = moduleFixture.get(UsersRepository);
	});

	describe('Find by not expired password reset token', (): void => {
		const expectedUser: User = users[7];

		const tokenMock: string = passwordResetTokens[2].token as string;
		const dateMock: Date = new Date('2025-08-07');

		beforeEach((): void => {
			jest.useFakeTimers();

			queryBuilderMock.getOne.mockReturnValue(expectedUser);
			queryBuilderMock.andWhere.mockImplementation((bracketsInstance: unknown) => {
				if (bracketsInstance instanceof Brackets) {
					bracketsInstance.whereFactory(queryBuilderMock as unknown as WhereExpressionBuilder);
				}

				return queryBuilderMock;
			});
		});

		afterEach((): void => {
			jest.useRealTimers();
			jest.clearAllMocks();
		});

		it('should use query builder and create a query for searching user by a not expired password reset token', async (): Promise<void> => {
			jest.setSystemTime(dateMock);

			await usersRepository.findByNotExpiredPasswordResetToken(tokenMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');

			expect(queryBuilderMock.innerJoinAndSelect).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.innerJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'user.passwordResetToken',
				'passwordResetToken',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				1,
				'passwordResetToken.token = :token',
				{ token: tokenMock },
			);

			expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				2,
				'passwordResetToken.expiresAt IS NULL',
			);

			expect(queryBuilderMock.orWhere).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.orWhere).toHaveBeenNthCalledWith(
				1,
				'passwordResetToken.expiresAt > :now',
				{ now: dateMock },
			);

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should return a user if it exist', async (): Promise<void> => {
			const user: User | null = await usersRepository.findByNotExpiredPasswordResetToken(tokenMock);

			expect(user).toEqual(expectedUser);
		});

		it('should return null if used does not exist', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const user: User | null = await usersRepository.findByNotExpiredPasswordResetToken(tokenMock);

			expect(user).toBeNull();
		});
	});
});
