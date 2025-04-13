import { connectionSource } from '@db/typeOrmConfig';
import { IOTPCodesRepository } from '@repositories/otpCodes/IOTPCodesRepository';
import { IAuthService } from '@services/auth/IAuthService';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { OTPCodesRepository } from '@repositories/otpCodes/OTPCodes.repository';
import { UsersRepository } from '@repositories/users/users.repository';
import { AuthService } from '@services/auth/auth.service';
import SpyInstance = jest.SpyInstance;
import { OTPCode } from '@entities/OTPCode.entity';
import { otpCodes } from '@testMocks/OTPCode/otpCodes';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { UpdateUserDto } from '../../../types/dto/users/UpdateUser.dto';
import { OTPCodesHelper } from '@helpers/OTPCodes.helper';
import { AccountActivationDto } from '../../../types/dto/auth/AccountActivation.dto';

describe.skip('AuthService', (): void => {
	let authService: IAuthService;
	let otpCodesRepository: IOTPCodesRepository;
	let usersRepository: IUsersRepository;

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(connectionSource);
		usersRepository = new UsersRepository(connectionSource);

		authService = new AuthService(otpCodesRepository, usersRepository);
	});

	describe('activateAccount', (): void => {
		let getUserOTPCodeByIdMock: SpyInstance;
		let updateUserMock: SpyInstance;
		let isExpiredMock: SpyInstance;

		const otpCodesMock: OTPCode[] = [...otpCodes];
		const usersMock: User[] = [...users];

		const existingOTPCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd099';
		const notExistingOTPCodeId: string = '1632043c-4d4b-4424-ac31-45189dedd099';
		const nullableOTPCodeId: string = '1662043c-4d4b-4424-ac31-55189dedd099';
		const existingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
		const notExistingUserId: string = 'f46816d7-90af-4c29-8e1a-227c90b33852';

		beforeEach((): void => {
			getUserOTPCodeByIdMock = jest
				.spyOn(otpCodesRepository, 'getUserOTPCodeById')
				.mockImplementation(async (id: string): Promise<OTPCode | null> => {
					return otpCodesMock.find((code: OTPCode) => code.id === id) || null;
				});

			updateUserMock = jest
				.spyOn(usersRepository, 'updateUser')
				.mockImplementation(
					async (userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<boolean> => {
						const userIndex = usersMock.findIndex((user: User) => user.id === userId);

						if (userIndex < 0) {
							return false;
						}

						usersMock[userIndex] = { ...usersMock[userIndex], ...updateUserDto };

						return true;
					},
				);

			isExpiredMock = jest.spyOn(OTPCodesHelper, 'isExpired');

			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.useRealTimers();
		});

		it('should be defined', (): void => {
			expect(authService.activateAccount).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authService.activateAccount).toBeInstanceOf(Function);
		});

		it('should call getUserOTPCodeById method in otpCodes repository to get user OTP code', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto: AccountActivationDto = {
				id: existingUserId,
				OTPCodeId: existingOTPCodeId,
				code: 111111,
			};

			await authService.activateAccount(accountActivationDto);

			expect(getUserOTPCodeByIdMock).toHaveBeenCalledTimes(1);
			expect(getUserOTPCodeByIdMock).toHaveBeenCalledWith(existingOTPCodeId);
		});

		it('should call isExpired method in OTPCodes helper to check if code was expired', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto: AccountActivationDto = {
				id: existingUserId,
				OTPCodeId: existingOTPCodeId,
				code: 111111,
			};

			await authService.activateAccount(accountActivationDto);

			expect(isExpiredMock).toHaveBeenCalledTimes(1);
			expect(isExpiredMock).toHaveBeenCalledWith({
				code: accountActivationDto.code,
				expiresAt: '2023-11-24 18:30:00',
			});
		});

		it('should call updateUser method in users repository to update isActivated status of user account', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto: AccountActivationDto = {
				id: existingUserId,
				OTPCodeId: existingOTPCodeId,
				code: 111111,
			};

			const updateUserDto: Partial<UpdateUserDto> = { isActivated: true };

			await authService.activateAccount(accountActivationDto);

			expect(updateUserMock).toHaveBeenCalledTimes(1);
			expect(updateUserMock).toHaveBeenCalledWith(existingUserId, updateUserDto);
		});

		it('should return false if OTP code with given id is not exist', async (): Promise<void> => {
			const accountActivationDto: AccountActivationDto = {
				id: existingUserId,
				OTPCodeId: notExistingOTPCodeId,
				code: 111111,
			};

			const isActivated: boolean = await authService.activateAccount(accountActivationDto);

			expect(isActivated).toBe(false);
		});

		it('should return false if OTP code is expire', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:35:00'));

			const accountActivationDto: AccountActivationDto = {
				id: existingUserId,
				OTPCodeId: existingOTPCodeId,
				code: 111111,
			};

			const isActivated: boolean = await authService.activateAccount(accountActivationDto);

			expect(isActivated).toBe(false);
		});

		it('should return false if OTP code is wrong', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto: AccountActivationDto = {
				id: existingUserId,
				OTPCodeId: existingOTPCodeId,
				code: 444444,
			};

			const isActivated: boolean = await authService.activateAccount(accountActivationDto);

			expect(isActivated).toBe(false);
		});

		it('should return false if user with given id is not exist', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto: AccountActivationDto = {
				id: notExistingUserId,
				OTPCodeId: existingOTPCodeId,
				code: 111111,
			};

			const isActivated: boolean = await authService.activateAccount(accountActivationDto);

			expect(isActivated).toBe(false);
		});

		it('should return false if code expiresAt is null', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto: AccountActivationDto = {
				id: existingUserId,
				OTPCodeId: nullableOTPCodeId,
				code: 333333,
			};

			const isActivated: boolean = await authService.activateAccount(accountActivationDto);

			expect(isActivated).toBe(false);
		});

		it('should return false if code is null', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto: AccountActivationDto = {
				id: existingUserId,
				OTPCodeId: nullableOTPCodeId,
				code: 333333,
			};

			const isActivated: boolean = await authService.activateAccount(accountActivationDto);

			expect(isActivated).toBe(false);
		});

		it('should return true if all data is valid', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto: AccountActivationDto = {
				id: existingUserId,
				OTPCodeId: existingOTPCodeId,
				code: 111111,
			};

			const isActivated: boolean = await authService.activateAccount(accountActivationDto);

			expect(isActivated).toBe(true);
		});
	});
});
