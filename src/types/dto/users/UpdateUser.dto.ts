import { JWTToken } from '@Entities/JWTToken.entity';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';

export class UpdateUserDto {
	about: string | null;
	avatarUrl: string | null;
	email: string;
	firstName: string;
	JWTToken: JWTToken | null;
	isActivated: boolean;
	lastName: string | null;
	nickname: string;
	password: string;
	passwordResetToken: PasswordResetToken | null;
}
