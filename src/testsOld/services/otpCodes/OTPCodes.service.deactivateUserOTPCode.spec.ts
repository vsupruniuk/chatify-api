import SpyInstance = jest.SpyInstance;
import { OTPCodesService } from '@services/otpCode/OTPCodes.service';
import { OTPCodesRepository } from '@repositories/otpCodes/OTPCodes.repository';
import { connectionSource } from '@db/typeOrmConfig';

describe.skip('OTPCodesService', (): void => {
	let otpCodesService: OTPCodesService;
	let otpCodesRepository: OTPCodesRepository;

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(connectionSource);

		otpCodesService = new OTPCodesService(otpCodesRepository);
	});

	describe('deactivateUserOTPCode', (): void => {
		let updateOTPCodeMock: SpyInstance;

		const existingCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd099';
		const notExistingCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd000';

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
			expect(otpCodesService.deactivateUserOTPCode).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(otpCodesService.deactivateUserOTPCode).toBeInstanceOf(Function);
		});

		it('should call updateOTPCode method in OTPCodes repository to deactivate code', async (): Promise<void> => {
			await otpCodesService.deactivateUserOTPCode(existingCodeId);

			expect(updateOTPCodeMock).toHaveBeenCalledTimes(1);
			expect(updateOTPCodeMock).toHaveBeenCalledWith(existingCodeId, {
				code: null,
				expiresAt: null,
			});
		});

		it("should return false if otp code wasn't deactivated", async (): Promise<void> => {
			const isUpdated: boolean = await otpCodesService.deactivateUserOTPCode(notExistingCodeId);

			expect(isUpdated).toBe(false);
		});

		it('should return true if otp code was deactivated', async (): Promise<void> => {
			const isUpdated: boolean = await otpCodesService.deactivateUserOTPCode(existingCodeId);

			expect(isUpdated).toBe(true);
		});
	});
});
