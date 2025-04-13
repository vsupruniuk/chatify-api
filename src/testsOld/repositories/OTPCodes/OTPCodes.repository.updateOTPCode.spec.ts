import { DataSource, UpdateResult } from 'typeorm';
import { OTPCodesRepository } from '@repositories/otpCodes/OTPCodes.repository';
import { UpdateOTPCodeDto } from '../../../types/dto/OTPCodes/UpdateOTPCode.dto';
import { OTPCode } from '@entities/OTPCode.entity';

describe.skip('OTPCodesRepository', (): void => {
	let otpCodesRepository: OTPCodesRepository;

	let resolvedAffectedValue: number = 0;

	const updateMock: jest.Mock = jest.fn().mockReturnThis();
	const setMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<UpdateResult> => {
		return <UpdateResult>{
			raw: [],
			affected: resolvedAffectedValue,
			generatedMaps: [],
		};
	});

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				update: updateMock,
				set: setMock,
				where: whereMock,
				execute: executeMock,
			};
		}),
	};

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(dataSourceMock);
	});

	describe('updateOTPCode', (): void => {
		const existingCodeId: string = '1662043c-4d4b-4424-ac31-35189dedd099';
		const notExistingCodeId: string = '1662043c-4d4b-4424-ac31-35189dedd000';
		const updateOTPCodeDto: UpdateOTPCodeDto = {
			code: null,
			expiresAt: null,
		};

		beforeEach((): void => {
			resolvedAffectedValue = 0;
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(otpCodesRepository.updateOTPCode).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(otpCodesRepository.updateOTPCode).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query and update OTP code', async (): Promise<void> => {
			await otpCodesRepository.updateOTPCode(existingCodeId, updateOTPCodeDto);

			expect(updateMock).toHaveBeenCalledTimes(1);
			expect(updateMock).toHaveBeenCalledWith(OTPCode);
			expect(setMock).toHaveBeenCalledTimes(1);
			expect(setMock).toHaveBeenCalledWith(updateOTPCodeDto);
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('id = :userOTPCodeId', {
				userOTPCodeId: existingCodeId,
			});
			expect(executeMock).toHaveBeenCalledTimes(1);
		});

		it('should return false if otp code with given id not exist', async (): Promise<void> => {
			const isUpdated: boolean = await otpCodesRepository.updateOTPCode(
				notExistingCodeId,
				updateOTPCodeDto,
			);

			expect(isUpdated).toBe(false);
		});

		it('should return true if otp code with given id exist and was updated', async (): Promise<void> => {
			resolvedAffectedValue = 1;

			const isUpdated: boolean = await otpCodesRepository.updateOTPCode(
				existingCodeId,
				updateOTPCodeDto,
			);

			expect(isUpdated).toBe(true);
		});
	});
});
