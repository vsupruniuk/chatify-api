import { Expose } from 'class-transformer';

export class PasswordResetTokenDto {
	@Expose()
	id: string;

	@Expose()
	expiresAt: string;

	@Expose()
	token: string;
}
