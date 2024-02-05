import { connectionSource } from '@DB/typeOrmConfig';
import { UpdateOTPCodeDto } from '@DTO/OTPCodes/UpdateOTPCode.dto';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { OTPCodesService } from '@Services/OTPCodes.service';
import SpyInstance = jest.SpyInstance;

describe('OTPCodesService', (): void => {
	let otpCodesService: OTPCodesService;
	let otpCodesRepository: OTPCodesRepository;

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(connectionSource);

		otpCodesService = new OTPCodesService(otpCodesRepository);
	});

	describe('updateOTPCode', (): void => {
		let updateOTPCodeMock: SpyInstance;

		const existingCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd099';
		const notExistingCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd000';
		const updateOTPCodeDto: UpdateOTPCodeDto = {
			code: null,
			expiresAt: null,
		};

		beforeEach((): void => {
			updateOTPCodeMock = jest
				.spyOn(otpCodesRepository, 'updateOTPCode')
				.mockImplementation(async (userOTPCodeId: string): Promise<boolean> => {
					return userOTPCodeId === existingCodeId;
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(otpCodesService.updateOTPCode).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(otpCodesService.updateOTPCode).toBeInstanceOf(Function);
		});

		it('should call updateOTPCode method in OTPCodes repository to update code', async (): Promise<void> => {
			await otpCodesService.updateOTPCode(existingCodeId, updateOTPCodeDto);

			expect(updateOTPCodeMock).toHaveBeenCalledTimes(1);
			expect(updateOTPCodeMock).toHaveBeenCalledWith(existingCodeId, updateOTPCodeDto);
		});

		it("should return false if otp code wasn't updated", async (): Promise<void> => {
			const isUpdated = await otpCodesService.updateOTPCode(notExistingCodeId, updateOTPCodeDto);

			expect(isUpdated).toBe(false);
		});

		it('should return true if otp code was updated', async (): Promise<void> => {
			const isUpdated = await otpCodesService.updateOTPCode(existingCodeId, updateOTPCodeDto);

			expect(isUpdated).toBe(true);
		});
	});
});
