import { connectionSource } from '@DB/typeOrmConfig';
import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { OTPCode } from '@Entities/OTPCode.entity';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { AuthService } from '@Services/auth.service';
import { otpCodes } from '@TestMocks/OTPCode/otpCodes';
import { users } from '@TestMocks/UserResponseDto/users';
import { plainToInstance } from 'class-transformer';
import SpyInstance = jest.SpyInstance;

describe('Auth service', (): void => {
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

		const otpCodesMock: OTPCode[] = [...otpCodes];
		const usersMock: UserShortDto[] = [...users];

		const existingOTPCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd099';
		const notExistingOTPCodeId: string = '1632043c-4d4b-4424-ac31-45189dedd099';
		const existingUserId: string = '1';
		const notExistingUserId: string = '5';

		beforeEach((): void => {
			getUserOTPCodeByIdMock = jest
				.spyOn(otpCodesRepository, 'getUserOTPCodeById')
				.mockImplementation(async (id: string): Promise<OTPCodeResponseDto> => {
					const otpCode: OTPCode | undefined = otpCodesMock.find((code: OTPCode) => code.id === id);

					return otpCode
						? plainToInstance(OTPCodeResponseDto, otpCode, { excludeExtraneousValues: true })
						: null;
				});

			updateUserMock = jest
				.spyOn(usersRepository, 'updateUser')
				.mockImplementation(
					async (userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<boolean> => {
						const userIndex = usersMock.findIndex((user: UserShortDto) => user.id === userId);

						if (userIndex < 0) {
							return false;
						}

						usersMock[userIndex] = { ...usersMock[userIndex], ...updateUserDto };

						return true;
					},
				);

			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.useRealTimers();
		});

		it('should be defined', (): void => {
			expect(authService.activateAccount).toBeDefined();
		});

		it('should call getUserOTPCodeById method in otpCodes repository to get user OTP code', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto: AccountActivationDto = {
				id: existingUserId,
				OTPCodeId: existingOTPCodeId,
				code: 111111,
			};

			await authService.activateAccount(accountActivationDto);

			expect(getUserOTPCodeByIdMock).toHaveBeenCalledWith(existingOTPCodeId);
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
