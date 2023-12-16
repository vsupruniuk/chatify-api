import { Expose } from 'class-transformer';

/**
 * DTO class representing user OTP code information
 */
export class OTPCodeResponseDto {
	@Expose()
	code: number | null;

	@Expose()
	expiresAt: string | null;
}
