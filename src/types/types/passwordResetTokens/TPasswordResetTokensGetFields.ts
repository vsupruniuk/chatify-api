import { PasswordResetTokenDto } from '../../dto/passwordResetTokens/passwordResetToken.dto';

export type TPasswordResetTokensGetFields = keyof Pick<PasswordResetTokenDto, 'id' | 'token'>;
