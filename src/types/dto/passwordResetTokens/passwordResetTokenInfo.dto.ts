import { PasswordResetTokenDto } from '@dtos/passwordResetToken/PasswordResetToken.dto';

export class PasswordResetTokenInfoDto extends (PasswordResetTokenDto as new () => Omit<
	PasswordResetTokenDto,
	'id'
>) {}
