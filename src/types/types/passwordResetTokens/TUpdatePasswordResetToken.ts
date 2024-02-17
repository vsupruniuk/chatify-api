import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';

export type TUpdatePasswordResetToken = Partial<Omit<PasswordResetTokenDto, 'id'>>;
