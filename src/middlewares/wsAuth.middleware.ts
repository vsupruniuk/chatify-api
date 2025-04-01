import { IJWTTokensService } from '@services/jwt/IJWTTokensService';
import { Socket, Event } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { GlobalTypes } from '../types/global';

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

			(event as unknown as GlobalTypes.TAuthorizedSocket).user = userData;

			next();
		} catch (error) {
			next(error);
		}
	};
};
