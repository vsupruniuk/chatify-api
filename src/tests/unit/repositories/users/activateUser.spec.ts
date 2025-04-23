import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { UsersRepository } from '@repositories/users/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { otpCodes } from '@testMocks/OTPCode/otpCodes';
import { OTPCode } from '@entities/OTPCode.entity';

describe('Users service', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let usersRepository: UsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, UsersRepository],
		}).compile();

		usersRepository = moduleFixture.get(UsersRepository);
	});

	describe('Activate user', (): void => {
		const expectedUser: User = users[1];

		const userIdMock: string = expectedUser.id;
		const otpCodeIdMock: string = otpCodes[2].id;

		beforeEach((): void => {
			queryBuilderMock.getOne.mockReturnValue(expectedUser);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersRepository.activateUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.activateUser).toBeInstanceOf(Function);
		});

		it('should use query builder and create a query for activating user account', async (): Promise<void> => {
			await usersRepository.activateUser(userIdMock, otpCodeIdMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.update).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.update).toHaveBeenNthCalledWith(1, User);

			expect(queryBuilderMock.set).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.set).toHaveBeenNthCalledWith(1, { isActivated: true });

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'id = :userId', {
				userId: userIdMock,
			});

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(2);
		});

		it('should use query builder and create a query for deactivating OTP code', async (): Promise<void> => {
			await usersRepository.activateUser(userIdMock, otpCodeIdMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.update).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.update).toHaveBeenNthCalledWith(2, OTPCode);

			expect(queryBuilderMock.set).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.set).toHaveBeenNthCalledWith(2, { code: null, expiresAt: null });

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(2, 'id = :otpCodeId', {
				otpCodeId: otpCodeIdMock,
			});

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(2);
		});

		it('should use query builder and fetch activated user', async (): Promise<void> => {
			await usersRepository.activateUser(userIdMock, otpCodeIdMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(3, 'user.id = :userId', {
				userId: userIdMock,
			});

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'user.jwtToken',
				'jwtToken',
			);

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should use a transaction to rollback all changes in case of any errors', async (): Promise<void> => {
			await usersRepository.activateUser(userIdMock, otpCodeIdMock);

			expect(queryBuilderMock.transaction).toHaveBeenCalledTimes(1);
		});

		it('should return a user if it was successfully activated', async (): Promise<void> => {
			const user: User | null = await usersRepository.activateUser(userIdMock, otpCodeIdMock);

			expect(user).toEqual(expectedUser);
		});

		it('should return null if failed to activate user', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const user: User | null = await usersRepository.activateUser(userIdMock, otpCodeIdMock);

			expect(user).toBeNull();
		});
	});
});
