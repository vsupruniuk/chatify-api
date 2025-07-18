import { OTPCodesHelper } from '@helpers/OTPCodes.helper';
import { OTPCodeDto } from '@dtos/otpCode/OTPCodeDto';
import { otpCodes } from '@testMocks/OTPCode/otpCodes';
import { OTPCode } from '@entities/OTPCode.entity';
import { plainToInstance } from 'class-transformer';
import { DateHelper } from '@helpers/date.helper';

describe('OTP codes helper', (): void => {
	describe('Is expired', (): void => {
		const otpCodeMock: OTPCode = otpCodes[2];

		const otpCode: OTPCodeDto = plainToInstance(OTPCodeDto, otpCodeMock, {
			excludeExtraneousValues: true,
		});

		beforeEach((): void => {
			jest.spyOn(DateHelper, 'isDateLessThanCurrent').mockReturnValue(true);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(OTPCodesHelper.isExpired).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(OTPCodesHelper.isExpired).toBeInstanceOf(Function);
		});

		it('should call is date less than current method from date helper to check if code is not expired', (): void => {
			OTPCodesHelper.isExpired(otpCode);

			expect(DateHelper.isDateLessThanCurrent).toHaveBeenCalledTimes(1);
			expect(DateHelper.isDateLessThanCurrent).toHaveBeenNthCalledWith(1, otpCodeMock.expiresAt);
		});

		it('should return true if expires at is empty string', (): void => {
			const isExpired: boolean = OTPCodesHelper.isExpired({ ...otpCode, expiresAt: '' });

			expect(isExpired).toBe(true);
		});

		it('should return true if expires at is less than current date', (): void => {
			const isExpired: boolean = OTPCodesHelper.isExpired(otpCode);

			expect(isExpired).toBe(true);
		});

		it('should return false if expires at is greater than current date or the same', (): void => {
			jest.spyOn(DateHelper, 'isDateLessThanCurrent').mockReturnValue(false);

			const isExpired: boolean = OTPCodesHelper.isExpired(otpCode);

			expect(isExpired).toBe(false);
		});
	});
});
