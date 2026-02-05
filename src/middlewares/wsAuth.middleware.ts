import { UnauthorizedException } from '@nestjs/common';

import { Socket, Event } from 'socket.io';

import { IJwtTokensService } from '@services';

import { JwtPayloadDto } from '@dtos/jwt';

import { AuthTypes } from '@customTypes';

type WSMiddleware = (event: Event, next: (error?: Error) => void) => Promise<void>;

/**
 * Middleware that runs on each new Web Socket connection and validates client authorization.
 * If client is not authorized, the next handler will be called with the relevant error
 * @param jwtTokensService - service for validation provided access token
 */
export const wsAuthMiddleware = (jwtTokensService: IJwtTokensService): WSMiddleware => {
	return async (event: Event, next: (error?: Error) => void): Promise<void> => {
		try {
			const authHeader: string | undefined = (event as unknown as Socket).handshake.headers
				.authorization;

			if (!authHeader) {
				throw new UnauthorizedException('Please, login to perform this action');
			}

			const [, accessToken]: string[] = authHeader.split(' ');

			if (!accessToken) {
				throw new UnauthorizedException('Please, login to perform this action');
			}

			const userData: JwtPayloadDto | null = await jwtTokensService.verifyAccessToken(accessToken);

			if (!userData) {
				throw new UnauthorizedException('Please, login to perform this action');
			}

			(event as unknown as AuthTypes.TAuthorizedSocket).user = userData;

			next();
		} catch (error: unknown) {
			next(error as UnauthorizedException);
		}
	};
};
