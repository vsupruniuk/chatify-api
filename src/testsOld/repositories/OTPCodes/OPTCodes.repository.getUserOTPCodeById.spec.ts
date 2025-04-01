import { DataSource } from 'typeorm';
import { OTPCodesRepository } from '@repositories/otpCode/OTPCodes.repository';
import { OTPCode } from '@entities/OTPCode.entity';
import { otpCodes } from '@testMocks/OTPCode/otpCodes';

describe.skip('OTPCodesRepository', (): void => {
	let otpCodesRepository: OTPCodesRepository;

	let resolvedValue: OTPCode | null = null;

	const selectMock: jest.Mock = jest.fn().mockReturnThis();
	const fromMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const getOneMock: jest.Mock = jest
		.fn()
		.mockImplementation(async (): Promise<OTPCode | null> => resolvedValue);

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				select: selectMock,
				from: fromMock,
				where: whereMock,
				getOne: getOneMock,
			};
		}),
	};

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(dataSourceMock);
	});

	describe('getUserOTPCodeById', (): void => {
		const otpCodesMock: OTPCode[] = [...otpCodes];
		const existingId: string = '1662043c-4d4b-4424-ac31-45189dedd099';
		const notExistingId: string = '1662543c-4d4b-4424-ac31-45189dedd099';
		const existingOtpCode: number = 111111;

		beforeEach((): void => {
			resolvedValue = null;
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(otpCodesRepository.getUserOTPCodeById).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(otpCodesRepository.getUserOTPCodeById).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query and find OTP code by id', async (): Promise<void> => {
			await otpCodesRepository.getUserOTPCodeById(existingId);

			expect(selectMock).toHaveBeenCalledTimes(1);
			expect(selectMock).toHaveBeenCalledWith('otpCode');
			expect(fromMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledWith(OTPCode, 'otpCode');
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('otpCode.id = :userOTPCodeId', {
				userOTPCodeId: existingId,
			});
			expect(getOneMock).toHaveBeenCalledTimes(1);
		});

		it('should return OTP code if it exist', async (): Promise<void> => {
			resolvedValue = otpCodesMock.find((code: OTPCode) => code.id === existingId) || null;

			const result: OTPCode | null = await otpCodesRepository.getUserOTPCodeById(existingId);

			expect(result?.code).toEqual(existingOtpCode);
		});

		it('should return OTP code as instance of OTPCode', async (): Promise<void> => {
			resolvedValue = otpCodesMock.find((code: OTPCode) => code.id === existingId) || null;

			const result: OTPCode | null = await otpCodesRepository.getUserOTPCodeById(existingId);

			expect(result).toBeInstanceOf(OTPCode);
		});

		it('should return null if OTP code not exist', async (): Promise<void> => {
			const result: OTPCode | null = await otpCodesRepository.getUserOTPCodeById(notExistingId);

			expect(result).toBeNull();
		});
	});
});
