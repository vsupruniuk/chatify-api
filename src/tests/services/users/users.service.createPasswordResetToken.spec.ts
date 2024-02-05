import { connectionSource } from '@DB/typeOrmConfig';
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
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => {
	return {
		v4: jest.fn().mockReturnValue('uuid-v4'),
	};
});

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

	describe('createPasswordResetToken', (): void => {
		let updateUserMock: SpyInstance;

		const usersMock: UserFullDto[] = [...users];
		const existingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
		const notExistingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33899';

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
			expect(usersService.createPasswordResetToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.createPasswordResetToken).toBeInstanceOf(Function);
		});

		it('should call uuid method for creating reset token', async (): Promise<void> => {
			await usersService.createPasswordResetToken(existingUserId);

			expect(uuidv4).toHaveBeenCalledTimes(1);
		});

		it('should call updateUser method in users repository to update user', async (): Promise<void> => {
			await usersService.createPasswordResetToken(existingUserId);

			expect(updateUserMock).toHaveBeenCalledTimes(1);
			expect(updateUserMock).toHaveBeenCalledWith(existingUserId, {
				passwordResetToken: 'uuid-v4',
			});
		});

		it('should return null if token for was not saved to db', async (): Promise<void> => {
			const result: string | null = await usersService.createPasswordResetToken(notExistingUserId);

			expect(result).toBeNull();
		});

		it('should return token if it was saved to db', async (): Promise<void> => {
			const result: string | null = await usersService.createPasswordResetToken(existingUserId);

			expect(result).toBe('uuid-v4');
		});
	});
});
