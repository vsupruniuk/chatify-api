import { Expose } from 'class-transformer';

export class PasswordResetTokenDto {
	@Expose()
	public id: string;

	@Expose()
	public expiresAt: string;

	@Expose()
	public token: string;
}
