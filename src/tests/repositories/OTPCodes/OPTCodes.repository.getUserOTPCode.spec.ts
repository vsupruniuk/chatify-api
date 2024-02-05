import { FindOneOptions } from 'typeorm';

import { connectionSource } from '@DB/typeOrmConfig';

import { OTPCode } from '@Entities/OTPCode.entity';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';

import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';

import { otpCodes } from '@TestMocks/OTPCode/otpCodes';

import SpyInstance = jest.SpyInstance;

describe('OTPCodesRepository', (): void => {
	let otpCodesRepository: OTPCodesRepository;

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(connectionSource);
	});

	describe('getUserOTPCodeById', (): void => {
		let findOneMock: SpyInstance;

		const otpCodesMock: OTPCode[] = [...otpCodes];
		const existingId: string = '1662043c-4d4b-4424-ac31-45189dedd099';
		const notExistingId: string = '1662543c-4d4b-4424-ac31-45189dedd099';
		const existingOtpCode: number = 111111;

		beforeEach((): void => {
			findOneMock = jest
				.spyOn(otpCodesRepository, 'findOne')
				.mockImplementation(async (options: FindOneOptions<OTPCode>): Promise<OTPCode | null> => {
					return (
						otpCodesMock.find((otpCode: OTPCode) => otpCode.id === options.where!['id']) || null
					);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(otpCodesRepository.getUserOTPCodeById).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(otpCodesRepository.getUserOTPCodeById).toBeInstanceOf(Function);
		});

		it('should use findOne method for searching OTP code', async (): Promise<void> => {
			await otpCodesRepository.getUserOTPCodeById(existingId);

			expect(findOneMock).toHaveBeenCalledTimes(1);
			expect(findOneMock).toHaveBeenCalledWith({ where: { id: existingId } });
		});

		it('should return OTP code if it exist', async (): Promise<void> => {
			const result: OTPCodeResponseDto | null =
				await otpCodesRepository.getUserOTPCodeById(existingId);

			expect(result?.code).toEqual(existingOtpCode);
		});

		it('should return OTP code as instance of OTPCodeResponseDto', async (): Promise<void> => {
			const result: OTPCodeResponseDto | null =
				await otpCodesRepository.getUserOTPCodeById(existingId);

			expect(result).toBeInstanceOf(OTPCodeResponseDto);
		});

		it('should return null if OTP code not exist', async (): Promise<void> => {
			const result: OTPCodeResponseDto | null =
				await otpCodesRepository.getUserOTPCodeById(notExistingId);

			expect(result).toBeNull();
		});
	});
});
