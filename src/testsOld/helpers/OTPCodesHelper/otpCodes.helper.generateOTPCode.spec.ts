import { OTPCodesHelper } from '@helpers/OTPCodes.helper';

describe.skip('otpCodesHelper', (): void => {
	describe('generateOTPCode', (): void => {
		const minValue: number = 100000;
		const maxValue: number = 999999;

		it('should be declared', (): void => {
			expect(OTPCodesHelper.generateOTPCode).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(OTPCodesHelper.generateOTPCode).toBeInstanceOf(Function);
		});

		it(`should return number equal greater than ${minValue}`, (): void => {
			const result: number = OTPCodesHelper.generateOTPCode();

			expect(result).toBeGreaterThanOrEqual(minValue);
		});

		it(`should return number equal less than ${maxValue}`, (): void => {
			const result: number = OTPCodesHelper.generateOTPCode();

			expect(result).toBeLessThanOrEqual(maxValue);
		});
	});
});
