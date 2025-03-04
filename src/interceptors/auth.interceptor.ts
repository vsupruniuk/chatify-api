import { Observable } from 'rxjs';
import {
	CallHandler,
	ExecutionContext,
	Inject,
	Injectable,
	NestInterceptor,
	UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request } from 'express';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IJWTTokensService } from '@services/jwt/IJWTTokensService';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { GlobalTypes } from '../typesNew/global';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
	constructor(
		@Inject(CustomProviders.CTF_JWT_TOKENS_SERVICE)
		private readonly _jwtTokensService: IJWTTokensService,
	) {}

	public async intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Promise<Observable<unknown>> {
		const httpArgumentsHost: HttpArgumentsHost = context.switchToHttp();
		const request: Request = httpArgumentsHost.getRequest<Request>();

		const authHeader: string | undefined = request.headers['authorization'];

		if (!authHeader) {
			throw new UnauthorizedException('Please, login to perform this action');
		}

		const [, accessToken] = authHeader.split(' ');

		if (!accessToken) {
			throw new UnauthorizedException('Please, login to perform this action');
		}

		const user: JWTPayloadDto | null = await this._jwtTokensService.verifyAccessToken(accessToken);

		if (!user) {
			throw new UnauthorizedException('Please, login to perform this action');
		}

		(request as GlobalTypes.TAuthorizedRequest).user = user;

		return next.handle();
	}
}
