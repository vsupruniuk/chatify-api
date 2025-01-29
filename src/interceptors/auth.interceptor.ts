import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import {
	CallHandler,
	ExecutionContext,
	Inject,
	Injectable,
	NestInterceptor,
	UnauthorizedException,
} from '@nestjs/common';
import { TUserPayload } from '@Types/users/TUserPayload';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
	constructor(
		@Inject(CustomProviders.I_JWT_TOKENS_SERVICE)
		private readonly _jwtTokensService: IJWTTokensService,
	) {}

	public async intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Promise<Observable<unknown>> {
		const request: Request & TUserPayload = context.switchToHttp().getRequest();

		const authHeader: string | undefined = request.headers.authorization;

		if (!authHeader) {
			throw new UnauthorizedException(['Please, login to perform this action']);
		}

		const [, accessToken]: string[] = authHeader.split(' ');

		if (!accessToken) {
			throw new UnauthorizedException(['Please, login to perform this action']);
		}

		const userData: JWTPayloadDto | null =
			await this._jwtTokensService.verifyAccessToken(accessToken);

		if (!userData) {
			throw new UnauthorizedException(['Please, login to perform this action']);
		}

		request.user = userData;

		return next.handle();
	}
}
