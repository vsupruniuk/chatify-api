import { plainToInstance } from 'class-transformer';

import { OtpCodesHelper, DateHelper } from '@helpers';

import { OtpCodeDto } from '@dtos/otpCode';

import { otpCodes } from '@testMocks';

import { OTPCode } from '@entities';

describe('OTP codes helper', (): void => {
	describe('Is expired', (): void => {
		const otpCodeMock: OTPCode = otpCodes[2];

		const otpCode: OtpCodeDto = plainToInstance(OtpCodeDto, otpCodeMock, {
			excludeExtraneousValues: true,
		});

		beforeEach((): void => {
			jest.spyOn(DateHelper, 'isDateLessThanCurrent').mockReturnValue(true);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call is date less than current method from date helper to check if code is not expired', (): void => {
			OtpCodesHelper.isExpired(otpCode);

			expect(DateHelper.isDateLessThanCurrent).toHaveBeenCalledTimes(1);
			expect(DateHelper.isDateLessThanCurrent).toHaveBeenNthCalledWith(1, otpCodeMock.expiresAt);
		});

		it('should return true if expires at is null', (): void => {
			const isExpired: boolean = OtpCodesHelper.isExpired({ ...otpCode, expiresAt: null });

			expect(isExpired).toBe(true);
		});

		it('should return true if expires at is less than current date', (): void => {
			const isExpired: boolean = OtpCodesHelper.isExpired(otpCode);

			expect(isExpired).toBe(true);
		});

		it('should return false if expires at is greater than current date or the same', (): void => {
			jest.spyOn(DateHelper, 'isDateLessThanCurrent').mockReturnValue(false);

			const isExpired: boolean = OtpCodesHelper.isExpired(otpCode);

			expect(isExpired).toBe(false);
		});
	});
});
