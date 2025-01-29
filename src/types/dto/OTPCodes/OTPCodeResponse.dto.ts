import { Expose } from 'class-transformer';

/**
 * DTO class representing user OTP code information
 */
export class OTPCodeResponseDto {
	@Expose()
	public code: number | null;

	@Expose()
	public expiresAt: string | null;
}
