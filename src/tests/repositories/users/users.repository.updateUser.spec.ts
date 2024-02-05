import { connectionSource } from '@DB/typeOrmConfig';
import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { UsersRepository } from '@Repositories/users.repository';
import { FindOptionsWhere, ObjectId, UpdateResult } from 'typeorm';
import SpyInstance = jest.SpyInstance;

describe('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	beforeEach((): void => {
		usersRepository = new UsersRepository(connectionSource);
	});

	describe('updateUser', (): void => {
		let updateMock: SpyInstance;
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
			updateMock = jest
				.spyOn(usersRepository, 'update')
				.mockImplementation(
					async <T>(
						criteria:
							| string
							| number
							| string[]
							| Date
							| ObjectId
							| number[]
							| Date[]
							| ObjectId[]
							| FindOptionsWhere<T>,
					): Promise<UpdateResult> => {
						const { id } = criteria as unknown as { id: string };

						return <UpdateResult>{
							raw: [],
							affected: id === existingUserId ? 1 : 0,
							generatedMaps: [],
						};
					},
				);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', async (): Promise<void> => {
			expect(usersRepository.updateUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.updateUser).toBeInstanceOf(Function);
		});

		it('should call update method to update user', async (): Promise<void> => {
			await usersRepository.updateUser(existingUserId, updateUserDto);

			expect(updateMock).toHaveBeenCalledTimes(1);
			expect(updateMock).toHaveBeenCalledWith({ id: existingUserId }, updateUserDto);
		});

		it('should return false if user with given id not exist', async (): Promise<void> => {
			const result: boolean = await usersRepository.updateUser(notExistingUserId, updateUserDto);

			expect(result).toBe(false);
		});

		it('should return true if user with given id exist and was updated', async (): Promise<void> => {
			const result: boolean = await usersRepository.updateUser(existingUserId, updateUserDto);

			expect(result).toBe(true);
		});
	});
});
