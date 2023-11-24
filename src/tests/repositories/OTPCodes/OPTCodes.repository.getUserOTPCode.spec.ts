import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { connectionSource } from '@DB/typeOrmConfig';
import SpyInstance = jest.SpyInstance;
import { OTPCode } from '@Entities/OTPCode.entity';
import { otpCodes } from '@TestMocks/OTPCode/otpCodes';
import { FindOneOptions } from 'typeorm';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';

describe('OTPCodesRepository', (): void => {
	let otpCodesRepository: OTPCodesRepository;

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(connectionSource);
	});

	describe('createOTPCode', (): void => {
		let findOneMock: SpyInstance;

		const otpCodesMock: OTPCode[] = [...otpCodes];
		const existingId: string = '1';
		const existingOtpCode: number = 111111;
		const notExistingId: string = '10';

		beforeEach((): void => {
			findOneMock = jest
				.spyOn(otpCodesRepository, 'findOne')
				.mockImplementation(async (options: FindOneOptions<OTPCode>): Promise<OTPCode | null> => {
					return (
						otpCodesMock.find((otpCode: OTPCode) => otpCode.id === options.where['id']) || null
					);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(otpCodesRepository.getUserOTPCode).toBeDefined();
		});

		it('should use findOne method for searching OTP code', async (): Promise<void> => {
			await otpCodesRepository.getUserOTPCode(existingId);

			expect(findOneMock).toHaveBeenCalledWith({ where: { id: existingId } });
		});

		it('should return OTP code if it exist', async (): Promise<void> => {
			const result: OTPCodeResponseDto = await otpCodesRepository.getUserOTPCode(existingId);

			expect(result.code).toEqual(existingOtpCode);
		});

		it('should return OTP code as instance of OTPCodeResponseDto', async (): Promise<void> => {
			const result: OTPCodeResponseDto = await otpCodesRepository.getUserOTPCode(existingId);

			expect(result).toBeInstanceOf(OTPCodeResponseDto);
		});

		it('should return null if OTP code not exist', async (): Promise<void> => {
			const result: OTPCodeResponseDto = await otpCodesRepository.getUserOTPCode(notExistingId);

			expect(result).toBeNull();
		});
	});
});
