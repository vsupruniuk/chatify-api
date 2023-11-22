/**
 * Helper clas for OTP codes
 */
export class OTPCodesHelper {
	public static generateOTPCode(): number {
		const minValue: number = 100000;
		const maxValue: number = 999999;

		return Math.floor(Math.random() * (maxValue - minValue) + minValue);
	}
}
