import { connectionSource } from '@DB/typeOrmConfig';
import { UpdateOTPCodeDto } from '@DTO/OTPCodes/UpdateOTPCode.dto';
import { DateHelper } from '@Helpers/date.helper';
import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';
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

	describe('createNewOTPCode', (): void => {
		let updateOTPCodeMock: SpyInstance;
		let generateOTPCodeMock: SpyInstance;
		let dateTimeNowMock: SpyInstance;

		const existingCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd099';
		const notExistingCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd000';
		const codeMock: number = 555555;
		const codeExpiresAtMock: string = '2024-01-03 18:25:00';

		const updateOTPCodeDto: UpdateOTPCodeDto = {
			code: codeMock,
			expiresAt: codeExpiresAtMock,
		};

		beforeEach((): void => {
			updateOTPCodeMock = jest
				.spyOn(otpCodesRepository, 'updateOTPCode')
				.mockImplementation(async (userOTPCodeId: string): Promise<boolean> => {
					return userOTPCodeId === existingCodeId;
				});

			generateOTPCodeMock = jest.spyOn(OTPCodesHelper, 'generateOTPCode').mockReturnValue(codeMock);
			dateTimeNowMock = jest.spyOn(DateHelper, 'dateTimeNow').mockReturnValue(codeExpiresAtMock);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(otpCodesService.createNewOTPCode).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(otpCodesService.createNewOTPCode).toBeInstanceOf(Function);
		});

		it('should call generateOTPCode in OTPCodesHelper to generate otp code', async (): Promise<void> => {
			await otpCodesService.createNewOTPCode(existingCodeId);

			expect(generateOTPCodeMock).toHaveBeenCalled();
		});

		it('should call dateTimeNow in DateHelper to get current date', async (): Promise<void> => {
			await otpCodesService.createNewOTPCode(existingCodeId);

			expect(dateTimeNowMock).toHaveBeenCalled();
		});

		it('should call updateOTPCode in otpCodesRepository to create new code for existing user', async (): Promise<void> => {
			await otpCodesService.createNewOTPCode(existingCodeId);

			expect(updateOTPCodeMock).toHaveBeenCalledWith(existingCodeId, updateOTPCodeDto);
		});

		it("should return false if new code wasn't created", async (): Promise<void> => {
			const isCreated: boolean = await otpCodesService.createNewOTPCode(notExistingCodeId);

			expect(isCreated).toBe(false);
		});

		it('should return true if new code was created', async (): Promise<void> => {
			const isCreated: boolean = await otpCodesService.createNewOTPCode(existingCodeId);

			expect(isCreated).toBe(true);
		});
	});
});
