/**
 * DTO class representing data required for creating OTP code
 */
export class CreateOTPCodeDto {
	public code: number;

	public expiresAt: string;
}
