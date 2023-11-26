/**
 * Helper clas for OTP codes
 */
export class OTPCodesHelper {
	/**
	 * Generate random OTP code between 100 000 and 999 999
	 * @return otpCode - generated OTP code
	 */
	public static generateOTPCode(): number {
		const minValue: number = 100000;
		const maxValue: number = 999999;

		return Math.floor(Math.random() * (maxValue - minValue) + minValue);
	}
}
