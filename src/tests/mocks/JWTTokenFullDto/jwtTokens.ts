import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { plainToInstance } from 'class-transformer';

export const jwtTokens: JWTTokenFullDto[] = [
	plainToInstance(JWTTokenFullDto, <JWTTokenFullDto>{
		id: '1',
		token: 'jwt-token-1',
	}),
	plainToInstance(JWTTokenFullDto, <JWTTokenFullDto>{
		id: '2',
		token: 'jwt-token-2',
	}),
	plainToInstance(JWTTokenFullDto, <JWTTokenFullDto>{
		id: '3',
		token: 'jwt-token-3',
	}),
];
