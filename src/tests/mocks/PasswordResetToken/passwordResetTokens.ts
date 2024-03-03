import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
import { User } from '@Entities/User.entity';
import { plainToInstance } from 'class-transformer';

export const passwordResetTokens: PasswordResetToken[] = [
	plainToInstance(PasswordResetToken, <PasswordResetToken>{
		id: '1',
		createdAt: '2024-02-28 17:00:00',
		token: 'password-reset-token-1',
		expiresAt: '2024-02-12 16:00:00',
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),

	plainToInstance(PasswordResetToken, <PasswordResetToken>{
		id: '2',
		createdAt: '2024-02-28 17:00:00',
		token: 'password-reset-token-2',
		expiresAt: '2024-02-10 16:00:00',
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),

	plainToInstance(PasswordResetToken, <PasswordResetToken>{
		id: '3',
		createdAt: '2024-02-28 17:00:00',
		token: 'password-reset-token-3',
		expiresAt: '2024-02-12 16:00:00',
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),
];
