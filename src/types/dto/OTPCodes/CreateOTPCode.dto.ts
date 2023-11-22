/**
 * DTO class representing data required for creating OTP code
 */
export class CreateOTPCodeDto {
	code: number;
	expiresAt: string;
}
