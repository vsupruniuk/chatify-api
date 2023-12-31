import { connectionSource } from '@DB/typeOrmConfig';
import { UpdateOTPCodeDto } from '@DTO/OTPCodes/UpdateOTPCode.dto';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { UpdateResult } from 'typeorm';
import SpyInstance = jest.SpyInstance;

describe('OTPCodesRepository', (): void => {
	let otpCodesRepository: OTPCodesRepository;

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(connectionSource);
	});

	describe('updateOTPCode', (): void => {
		let updateMock: SpyInstance;

		const existingCodeId: string = '1662043c-4d4b-4424-ac31-35189dedd099';
		const notExistingCodeId: string = '1662043c-4d4b-4424-ac31-35189dedd000';
		const updateOTPCodeDto: UpdateOTPCodeDto = {
			code: null,
			expiresAt: null,
		};

		beforeEach((): void => {
			updateMock = jest
				.spyOn(otpCodesRepository, 'update')
				.mockImplementation(async ({ id }: { id: string }): Promise<UpdateResult> => {
					return <UpdateResult>{
						raw: [],
						affected: id === existingCodeId ? 1 : 0,
						generatedMaps: [],
					};
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(otpCodesRepository.updateOTPCode).toBeDefined();
		});

		it('should call update method to update otp code', async (): Promise<void> => {
			await otpCodesRepository.updateOTPCode(existingCodeId, updateOTPCodeDto);

			expect(updateMock).toHaveBeenCalled();
		});

		it('should return false if otp code with given id not exist', async (): Promise<void> => {
			const isUpdated: boolean = await otpCodesRepository.updateOTPCode(
				notExistingCodeId,
				updateOTPCodeDto,
			);

			expect(isUpdated).toBe(false);
		});

		it('should return true if otp code with given id exist and was updated', async (): Promise<void> => {
			const isUpdated: boolean = await otpCodesRepository.updateOTPCode(
				existingCodeId,
				updateOTPCodeDto,
			);

			expect(isUpdated).toBe(true);
		});
	});
});
