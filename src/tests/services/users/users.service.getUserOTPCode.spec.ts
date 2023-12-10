import { plainToInstance } from 'class-transformer';

import { connectionSource } from '@DB/typeOrmConfig';

import { OTPCode } from '@Entities/OTPCode.entity';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';

import { UsersService } from '@Services/users.service';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';

import { otpCodes } from '@TestMocks/OTPCode/otpCodes';

import SpyInstance = jest.SpyInstance;

describe('Users service', (): void => {
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

	describe('getUserOTPCode', (): void => {
		let getUserOTPCodeMock: SpyInstance;

		const otpCodesMock: OTPCode[] = [...otpCodes];
		const existingId: string = '1';
		const notExistingId: string = '10';
		const existingOtpCode: number = 111111;

		beforeEach((): void => {
			getUserOTPCodeMock = jest
				.spyOn(otpCodesRepository, 'getUserOTPCode')
				.mockImplementation(async (userOTPCodeId: string): Promise<OTPCodeResponseDto | null> => {
					const otpCode: OTPCode = otpCodesMock.find(
						(otpCode: OTPCode) => otpCode.id === userOTPCodeId,
					);

					return otpCode
						? plainToInstance(OTPCodeResponseDto, otpCode, { excludeExtraneousValues: true })
						: null;
				});

			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.useRealTimers();
		});

		it('should be declared', (): void => {
			expect(usersService.getUserOTPCode).toBeDefined();
		});

		it('should use getUserOTPCode method from users repository for searching OTP code', async (): Promise<void> => {
			await usersService.getUserOTPCode(existingId);

			expect(getUserOTPCodeMock).toHaveBeenCalledWith(existingId);
		});

		it('should return OTP code, if it exist', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const foundedCode: OTPCodeResponseDto = await usersService.getUserOTPCode(existingId);

			expect(foundedCode.code).toEqual(existingOtpCode);
		});

		it('should return founded OTP code as instance of OTPCodeResponseDto', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const foundedCode: OTPCodeResponseDto = await usersService.getUserOTPCode(existingId);

			expect(foundedCode).toBeInstanceOf(OTPCodeResponseDto);
		});

		it('should return null, if OTP code not exist', async (): Promise<void> => {
			const foundedCode: OTPCodeResponseDto = await usersService.getUserOTPCode(notExistingId);

			expect(foundedCode).toBeNull();
		});

		it('should return null if code expires', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-12-24 18:40:00'));

			const foundedCode: OTPCodeResponseDto = await usersService.getUserOTPCode(existingId);

			expect(foundedCode).toBeNull();
		});
	});
});
