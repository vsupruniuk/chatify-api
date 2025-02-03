import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import { UnauthorizedException } from '@nestjs/common';
import { TUserPayload } from '@Types/users/TUserPayload';
import { Socket, Event } from 'socket.io';

type WSMiddleware = (event: Event, next: (error?: Error) => void) => void;

export const WsAuthMiddleware = (jwtTokensService: IJWTTokensService): WSMiddleware => {
	return async (event: Event, next: (error?: Error) => void): Promise<void> => {
		try {
			const authHeader: string | undefined = (event as unknown as Socket).handshake.headers
				.authorization;

			if (!authHeader) {
				throw new UnauthorizedException(['Please, login to perform this action']);
			}

			const [, accessToken]: string[] = authHeader.split(' ');

			if (!accessToken) {
				throw new UnauthorizedException(['Please, login to perform this action']);
			}

			const userData: JWTPayloadDto | null = await jwtTokensService.verifyAccessToken(accessToken);

			if (!userData) {
				throw new UnauthorizedException(['Please, login to perform this action']);
			}

			(event as unknown as Socket & TUserPayload).user = userData;

			next();
		} catch (error) {
			next(error);
		}
	};
};
