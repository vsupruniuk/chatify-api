import { DataSource, UpdateResult } from 'typeorm';
import { UsersRepository } from '@repositories/users/users.repository';
import { UpdateUserDto } from '../../../types/dto/users/UpdateUser.dto';
import { User } from '@entities/User.entity';

describe.skip('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	let resolvedAffectedValue: number = 0;

	const updateMock: jest.Mock = jest.fn().mockReturnThis();
	const setMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<UpdateResult> => {
		return <UpdateResult>{
			raw: [],
			affected: resolvedAffectedValue,
			generatedMaps: [],
		};
	});

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				update: updateMock,
				set: setMock,
				where: whereMock,
				execute: executeMock,
			};
		}),
	};

	beforeEach((): void => {
		usersRepository = new UsersRepository(dataSourceMock);
	});

	describe('updateUser', (): void => {
		const existingUserId: string = '1';
		const notExistingUserId: string = '2';
		const updateUserDto: Partial<UpdateUserDto> = {
			about: 'No Banner, Only Hulk!',
			avatarUrl: 'hulk.png',
			email: 'hulk@mail.com',
			firstName: 'Hulk',
			isActivated: true,
			lastName: null,
			nickname: 'hulk',
		};

		beforeEach((): void => {
			resolvedAffectedValue = 0;
			jest.clearAllMocks();
		});

		it('should be declared', async (): Promise<void> => {
			expect(usersRepository.updateUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.updateUser).toBeInstanceOf(Function);
		});

		it('should user queryBuilder to build query and update user', async (): Promise<void> => {
			await usersRepository.updateUser(existingUserId, updateUserDto);

			expect(updateMock).toHaveBeenCalledTimes(1);
			expect(updateMock).toHaveBeenCalledWith(User);
			expect(setMock).toHaveBeenCalledTimes(1);
			expect(setMock).toHaveBeenCalledWith(updateUserDto);
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('id = :userId', { userId: existingUserId });
			expect(executeMock).toHaveBeenCalledTimes(1);
		});

		it('should return false if user with given id not exist', async (): Promise<void> => {
			const result: boolean = await usersRepository.updateUser(notExistingUserId, updateUserDto);

			expect(result).toBe(false);
		});

		it('should return true if user with given id exist and was updated', async (): Promise<void> => {
			resolvedAffectedValue = 1;

			const result: boolean = await usersRepository.updateUser(existingUserId, updateUserDto);

			expect(result).toBe(true);
		});
	});
});
