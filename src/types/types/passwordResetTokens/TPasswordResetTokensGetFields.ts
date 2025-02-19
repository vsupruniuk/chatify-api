import { PasswordResetTokenDto } from '@dtos/passwordResetToken/PasswordResetToken.dto';

export type TPasswordResetTokensGetFields = keyof Pick<PasswordResetTokenDto, 'id' | 'token'>;
