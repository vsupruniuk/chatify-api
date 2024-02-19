import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';

export class PasswordResetTokenInfoDto extends (PasswordResetTokenDto as new () => Omit<
	PasswordResetTokenDto,
	'id'
>) {}
