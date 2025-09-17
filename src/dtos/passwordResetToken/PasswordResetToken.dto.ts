import { Expose } from 'class-transformer';

export class PasswordResetTokenDto {
	@Expose()
	public id: string;

	@Expose()
	public expiresAt: string | null;

	@Expose()
	public token: string;
}
