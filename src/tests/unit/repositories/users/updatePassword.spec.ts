import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { QueryBuilderMock, users, passwordResetTokens } from '@testMocks';

import { UsersRepository } from '@repositories';

import { User, PasswordResetToken } from '@entities';

describe('Users repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let usersRepository: UsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, UsersRepository],
		}).compile();

		usersRepository = moduleFixture.get(UsersRepository);
	});

	describe('Update password', (): void => {
		const expectedUser: User = users[3];

		const userIdMock: string = expectedUser.id;
		const tokenIdMock: string = passwordResetTokens[2].id;
		const passwordMock: string = 'Qwerty12345!';

		beforeEach((): void => {
			queryBuilderMock.getOne.mockReturnValue(expectedUser);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder and update user password', async (): Promise<void> => {
			await usersRepository.updatePassword(userIdMock, tokenIdMock, passwordMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.update).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.update).toHaveBeenNthCalledWith(1, User);

			expect(queryBuilderMock.set).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.set).toHaveBeenNthCalledWith(1, { password: passwordMock });

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'id = :userId', {
				userId: userIdMock,
			});

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(2);
		});

		it('should use query builder and reset user password reset token', async (): Promise<void> => {
			await usersRepository.updatePassword(userIdMock, tokenIdMock, passwordMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.update).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.update).toHaveBeenNthCalledWith(2, PasswordResetToken);

			expect(queryBuilderMock.set).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.set).toHaveBeenNthCalledWith(2, { token: null, expiresAt: null });

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(2, 'id = :tokenId', {
				tokenId: tokenIdMock,
			});

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(2);
		});

		it('should use query builder and fetch updated user', async (): Promise<void> => {
			await usersRepository.updatePassword(userIdMock, tokenIdMock, passwordMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(3, 'user.id = :userId', {
				userId: userIdMock,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should use a transaction to rollback all changes in case of any error', async (): Promise<void> => {
			await usersRepository.updatePassword(userIdMock, tokenIdMock, passwordMock);

			expect(queryBuilderMock.transaction).toHaveBeenCalledTimes(1);
		});

		it('should return updated user if it was updated', async (): Promise<void> => {
			const user: User | null = await usersRepository.updatePassword(
				userIdMock,
				tokenIdMock,
				passwordMock,
			);

			expect(user).toEqual(expectedUser);
		});

		it('should return null if failed to find updated user', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const user: User | null = await usersRepository.updatePassword(
				userIdMock,
				tokenIdMock,
				passwordMock,
			);

			expect(user).toBeNull();
		});
	});
});
