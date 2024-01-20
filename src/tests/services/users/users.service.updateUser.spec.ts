import { connectionSource } from '@DB/typeOrmConfig';
import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { UsersService } from '@Services/users.service';
import { users } from '@TestMocks/UserFullDto/users';
import SpyInstance = jest.SpyInstance;

describe('UsersService', (): void => {
	let usersService: IUsersService;
	let usersRepository: IUsersRepository;
	let accountSettingsRepository: IAccountSettingsRepository;
	let otpCodesRepository: IOTPCodesRepository;

	beforeEach((): void => {
		usersRepository = new UsersRepository(connectionSource);
		accountSettingsRepository = new AccountSettingsRepository(connectionSource);
		otpCodesRepository = new OTPCodesRepository(connectionSource);

		usersService = new UsersService(accountSettingsRepository, otpCodesRepository, usersRepository);
	});

	describe('updateUser', (): void => {
		let updateUserMock: SpyInstance;

		const usersMock: UserFullDto[] = [...users];
		const existingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
		const notExistingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b44442';
		const updateUserDto: Partial<UpdateUserDto> = {
			firstName: 'Bruce',
			lastName: 'Banner',
		};

		beforeEach((): void => {
			updateUserMock = jest
				.spyOn(usersRepository, 'updateUser')
				.mockImplementation(async (userId: string): Promise<boolean> => {
					return usersMock.some((user: UserFullDto) => user.id === userId);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersService.updateUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.updateUser).toBeInstanceOf(Function);
		});

		it('should call updateUser method in users repository to update user', async (): Promise<void> => {
			await usersService.updateUser(existingUserId, updateUserDto);

			expect(updateUserMock).toHaveBeenCalled();
		});

		it('should return false if user with given id not exist', async (): Promise<void> => {
			const result: boolean = await usersService.updateUser(notExistingUserId, updateUserDto);

			expect(result).toBe(false);
		});

		it('should return true if user with given id exist', async (): Promise<void> => {
			const result: boolean = await usersService.updateUser(existingUserId, updateUserDto);

			expect(result).toBe(true);
		});
	});
});
