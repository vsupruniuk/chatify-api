import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';

describe('otpCodesHelper', (): void => {
	describe('generateOTPCode', (): void => {
		const minValue: number = 100000;
		const maxValue: number = 999999;

		it('should be declared', () => {
			expect(OTPCodesHelper.generateOTPCode).toBeDefined();
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
