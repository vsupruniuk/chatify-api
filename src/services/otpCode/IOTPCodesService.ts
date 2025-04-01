export interface IOTPCodesService {
	/**
	 * Method for regenerating OTP code and expiration date for existing core record
	 * @param id - code id
	 * @returns generated code
	 */
	regenerateCode(id: string): Promise<number | null>;
}
