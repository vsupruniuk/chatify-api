import * as crypto from 'crypto';

import { OTPCodesHelper } from '@helpers';

describe('OTP codes helper', (): void => {
	describe('Generate OTP code', (): void => {
		beforeEach((): void => {
			jest
				.spyOn(crypto, 'randomInt')
				.mockImplementationOnce(() => 1)
				.mockImplementationOnce(() => 2)
				.mockImplementationOnce(() => 3)
				.mockImplementationOnce(() => 4)
				.mockImplementationOnce(() => 5)
				.mockImplementationOnce(() => 6);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should use random int method from crypto module to generate otp code', (): void => {
			OTPCodesHelper.generateOTPCode();

			expect(crypto.randomInt).toHaveBeenCalledTimes(6);
			expect(crypto.randomInt).toHaveBeenCalledWith(1, 10);
		});

		it('should return a generated code', (): void => {
			const code: number = OTPCodesHelper.generateOTPCode();

			expect(code).toBe(123456);
		});
	});
});
