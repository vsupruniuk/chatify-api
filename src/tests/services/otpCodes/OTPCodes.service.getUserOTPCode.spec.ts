import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';
import { OTPCodesService } from '@Services/OTPCodes.service';
import { plainToInstance } from 'class-transformer';
import { connectionSource } from '@DB/typeOrmConfig';
import { OTPCode } from '@Entities/OTPCode.entity';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { otpCodes } from '@TestMocks/OTPCode/otpCodes';

import SpyInstance = jest.SpyInstance;

describe('OTPCodesService', (): void => {
	let otpCodesService: OTPCodesService;
	let otpCodesRepository: OTPCodesRepository;

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(connectionSource);

		otpCodesService = new OTPCodesService(otpCodesRepository);
	});

	describe('getUserOTPCode', (): void => {
		let getUserOTPCodeMock: SpyInstance;
		let isExpiredMock: SpyInstance;

		const otpCodesMock: OTPCode[] = [...otpCodes];
		const existingId: string = '1662043c-4d4b-4424-ac31-45189dedd099';
		const notExistingId: string = '1162043c-4d4b-4424-ac31-45189dedd099';
		const existingOtpCode: number = 111111;

		beforeEach((): void => {
			getUserOTPCodeMock = jest
				.spyOn(otpCodesRepository, 'getUserOTPCodeById')
				.mockImplementation(
					async (userOTPCodeId: string | null): Promise<OTPCodeResponseDto | null> => {
						const otpCode: OTPCode | undefined = otpCodesMock.find(
							(otpCode: OTPCode) => otpCode.id === userOTPCodeId,
						);

						return otpCode
							? plainToInstance(OTPCodeResponseDto, otpCode, { excludeExtraneousValues: true })
							: null;
					},
				);

			isExpiredMock = jest.spyOn(OTPCodesHelper, 'isExpired');

			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.useRealTimers();
		});

		it('should be declared', (): void => {
			expect(otpCodesService.getUserOTPCode).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(otpCodesService.getUserOTPCode).toBeInstanceOf(Function);
		});

		it('should use getUserOTPCode method from users repository for searching OTP code', async (): Promise<void> => {
			await otpCodesService.getUserOTPCode(existingId);

			expect(getUserOTPCodeMock).toHaveBeenCalledTimes(1);
			expect(getUserOTPCodeMock).toHaveBeenCalledWith(existingId);
		});

		it('should use OTPCodes helper to check if code is expired', async (): Promise<void> => {
			await otpCodesService.getUserOTPCode(existingId);

			expect(isExpiredMock).toHaveBeenCalled();
		});

		it('should return OTP code, if it exist', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const foundedCode: OTPCodeResponseDto | null =
				await otpCodesService.getUserOTPCode(existingId);

			expect(foundedCode?.code).toEqual(existingOtpCode);
		});

		it('should return founded OTP code as instance of OTPCodeResponseDto', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const foundedCode: OTPCodeResponseDto | null =
				await otpCodesService.getUserOTPCode(existingId);

			expect(foundedCode).toBeInstanceOf(OTPCodeResponseDto);
		});

		it('should return null, if OTP code not exist', async (): Promise<void> => {
			const foundedCode: OTPCodeResponseDto | null =
				await otpCodesService.getUserOTPCode(notExistingId);

			expect(foundedCode).toBeNull();
		});

		it('should return null, null was passed to method', async (): Promise<void> => {
			const foundedCode: OTPCodeResponseDto | null = await otpCodesService.getUserOTPCode(null);

			expect(foundedCode).toBeNull();
		});

		it('should return null if code expires', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-12-24 18:40:00'));

			const foundedCode: OTPCodeResponseDto | null =
				await otpCodesService.getUserOTPCode(existingId);

			expect(foundedCode).toBeNull();
		});
	});
});
