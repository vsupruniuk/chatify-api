import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';

export type TPasswordResetTokensGetFields = keyof Pick<PasswordResetTokenDto, 'id' | 'token'>;
