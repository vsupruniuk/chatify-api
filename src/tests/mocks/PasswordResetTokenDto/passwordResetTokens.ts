import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { plainToInstance } from 'class-transformer';

export const passwordResetTokens: PasswordResetTokenDto[] = [
	plainToInstance(PasswordResetTokenDto, <PasswordResetTokenDto>{
		id: '1',
		token: 'password-reset-token-1',
		expiresAt: '2024-02-12 16:00:00',
	}),

	plainToInstance(PasswordResetTokenDto, <PasswordResetTokenDto>{
		id: '2',
		token: 'password-reset-token-2',
		expiresAt: '2024-02-10 16:00:00',
	}),

	plainToInstance(PasswordResetTokenDto, <PasswordResetTokenDto>{
		id: '3',
		token: 'password-reset-token-3',
		expiresAt: '2024-02-12 16:00:00',
	}),
];
