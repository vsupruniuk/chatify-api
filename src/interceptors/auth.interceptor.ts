import {
	CallHandler,
	ExecutionContext,
	Inject,
	Injectable,
	NestInterceptor,
	UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { Observable } from 'rxjs';
import { Request } from 'express';

import { CustomProvider } from '@enums';

import { IJwtTokensService } from '@services';

import { JwtPayloadDto } from '@dtos/jwt';

import { AuthTypes } from '@customTypes';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
	constructor(
		@Inject(CustomProvider.CTF_JWT_TOKENS_SERVICE)
		private readonly _jwtTokensService: IJwtTokensService,
	) {}

	public async intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Promise<Observable<unknown>> {
		const httpArgumentsHost: HttpArgumentsHost = context.switchToHttp();
		const request: Request = httpArgumentsHost.getRequest<Request>();

		const authHeader: string | undefined = request.headers.authorization;

		if (!authHeader) {
			throw new UnauthorizedException('Please, login to perform this action');
		}

		const [, accessToken] = authHeader.split(' ');

		if (!accessToken) {
			throw new UnauthorizedException('Please, login to perform this action');
		}

		const user: JwtPayloadDto | null = await this._jwtTokensService.verifyAccessToken(accessToken);

		if (!user) {
			throw new UnauthorizedException('Please, login to perform this action');
		}

		(request as AuthTypes.TAuthorizedRequest).user = user;

		return next.handle();
	}
}
