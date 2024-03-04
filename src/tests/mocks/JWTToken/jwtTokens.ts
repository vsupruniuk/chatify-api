import { JWTToken } from '@Entities/JWTToken.entity';
import { User } from '@Entities/User.entity';
import { plainToInstance } from 'class-transformer';

export const jwtTokens: JWTToken[] = [
	plainToInstance(JWTToken, <JWTToken>{
		id: '1',
		createdAt: '2024-02-28 17:00:00',
		token: 'jwt-token-1',
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),
	plainToInstance(JWTToken, <JWTToken>{
		id: '2',
		createdAt: '2024-02-28 17:00:00',
		token: 'jwt-token-2',
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),
	plainToInstance(JWTToken, <JWTToken>{
		id: '3',
		createdAt: '2024-02-28 17:00:00',
		token: 'jwt-token-3',
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),
];
