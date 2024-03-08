import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import { CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Guard that check if user authorized or not.
 * If user authorizer - next action will be executed. If not - Unauthorized exception will be thrown
 */
export class AuthGuard implements CanActivate {
	constructor(
		@Inject(CustomProviders.I_JWT_TOKENS_SERVICE)
		private readonly _jwtTokensService: IJWTTokensService,
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest();

		const authHeader: string | undefined = request.headers['authorization'];

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

		return true;
	}
}
