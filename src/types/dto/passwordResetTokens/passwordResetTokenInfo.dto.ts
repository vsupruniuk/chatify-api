import { PasswordResetTokenDto } from './passwordResetToken.dto';

export class PasswordResetTokenInfoDto extends (PasswordResetTokenDto as new () => Omit<
	PasswordResetTokenDto,
	'id'
>) {}
