import { Expose } from 'class-transformer';

export class OTPCodeResponseDto {
	@Expose()
	code: number | null;

	@Expose()
	expiresAt: string | null;
}
