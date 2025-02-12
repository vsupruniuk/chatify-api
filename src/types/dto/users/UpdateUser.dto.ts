import { JWTToken } from '@db/entities/JWTToken.entity';
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';

export class UpdateUserDto {
	public about: string | null;

	public avatarUrl: string | null;

	public email: string;

	public firstName: string;

	public JWTToken: JWTToken | null;

	public isActivated: boolean;

	public lastName: string | null;

	public nickname: string;

	public password: string;

	public passwordResetToken: PasswordResetToken | null;
}
