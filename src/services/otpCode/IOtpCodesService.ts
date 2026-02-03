/**
 * Service interface for actions with OTP codes
 */
export interface IOtpCodesService {
	/**
	 * Generates new OTP code and save to database
	 * @param id - id of OTP code record
	 * @returns Promise<number | null> - generated code value or null if failed to generate new code
	 */
	regenerateCode(id: string): Promise<number | null>;
}
