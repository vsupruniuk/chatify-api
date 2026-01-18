import * as crypto from 'node:crypto';

import { OtpCodesHelper } from '@helpers';

import { otpCodeConfig } from '@configs';

describe('OTP codes helper', (): void => {
	describe('Generate OTP code', (): void => {
		const randomIntMock: number = 567891;

		beforeEach((): void => {
			jest.spyOn(crypto, 'randomInt').mockImplementation(() => randomIntMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call random int method from crypto module to generate otp code', (): void => {
			OtpCodesHelper.generateOTPCode();

			expect(crypto.randomInt).toHaveBeenCalledTimes(1);
			expect(crypto.randomInt).toHaveBeenCalledWith(otpCodeConfig.minValue, otpCodeConfig.maxValue);
		});

		it('should return a generated code', (): void => {
			const code: number = OtpCodesHelper.generateOTPCode();

			expect(code).toBe(randomIntMock);
		});
	});
});
