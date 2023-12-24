import { connectionSource } from '@DB/typeOrmConfig';
import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { UsersRepository } from '@Repositories/users.repository';
import { UpdateResult } from 'typeorm';
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
		const updateUserDto: UpdateUserDto = {
			about: 'No Banner, Only Hulk!',
			avatarUrl: 'hulk.png',
			email: 'hulk@mail.com',
			firstName: 'Hulk',
			isActivated: true,
			lastName: null,
			nickname: 'hulk',
			password: '12345Hulk',
		};

		beforeEach((): void => {
			updateMock = jest
				.spyOn(usersRepository, 'update')
				.mockImplementation(({ id }: { id: string }): Promise<UpdateResult> => {
					return Promise.resolve<UpdateResult>({
						raw: [],
						affected: id === existingUserId ? 1 : 0,
						generatedMaps: [],
					});
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', async (): Promise<void> => {
			expect(usersRepository.updateUser).toBeDefined();
		});

		it('should call update method to update user', async (): Promise<void> => {
			await usersRepository.updateUser(existingUserId, updateUserDto);

			expect(updateMock).toHaveBeenCalled();
		});

		it('should return false if user with given id not exist', async (): Promise<void> => {
			const result: boolean = await usersRepository.updateUser(notExistingUserId, updateUserDto);

			expect(result).toBeFalsy();
		});

		it('should return true if user with given id exist and was updated', async (): Promise<void> => {
			const result: boolean = await usersRepository.updateUser(existingUserId, updateUserDto);

			expect(result).toBeTruthy();
		});
	});
});