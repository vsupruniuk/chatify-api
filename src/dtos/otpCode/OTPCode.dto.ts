import { Expose } from 'class-transformer';

export class OTPCodeDto {
	@Expose()
	public id: string;

	@Expose()
	public code: number;

	@Expose()
	public expiresAt: string | null;
}
