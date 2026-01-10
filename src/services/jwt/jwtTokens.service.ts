import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IJwtTokensService } from '@services';

import { JwtPayloadDto } from '@dtos/jwt';

import { CustomProvider } from '@enums';

import { IJwtTokensRepository } from '@repositories';

import { JWTToken } from '@entities';

import { jwtConfig } from '@configs';

export class JwtTokensService implements IJwtTokensService {
	constructor(
		private readonly _jwtService: JwtService,

		@Inject(CustomProvider.CTF_JWT_TOKENS_REPOSITORY)
		private readonly _jwtTokensRepository: IJwtTokensRepository,
	) {}

	public async generateAccessToken(payload: JwtPayloadDto): Promise<string> {
		return await this._jwtService.signAsync(payload, {
			secret: jwtConfig.accessTokenSecret,
			expiresIn: jwtConfig.accessTokenExpiresIn,
		});
	}

	public async generateRefreshToken(payload: JwtPayloadDto): Promise<string> {
		return await this._jwtService.signAsync(payload, {
			secret: jwtConfig.refreshTokenSecret,
			expiresIn: jwtConfig.refreshTokenExpiresIn,
		});
	}

	public async verifyAccessToken(token: string): Promise<JwtPayloadDto | null> {
		try {
			return await this._jwtService.verifyAsync<JwtPayloadDto>(token, {
				secret: jwtConfig.accessTokenSecret,
			});
		} catch (err) {
			return null;
		}
	}

	public async verifyRefreshToken(token: string): Promise<JwtPayloadDto | null> {
		try {
			return await this._jwtService.verifyAsync<JwtPayloadDto>(token, {
				secret: jwtConfig.refreshTokenSecret,
			});
		} catch (err) {
			return null;
		}
	}

	public async saveRefreshToken(id: string, token: string): Promise<void> {
		await this._jwtTokensRepository.updateToken(id, token);
	}

	public async resetUserToken(userId: string): Promise<boolean> {
		const updatedToken: JWTToken = await this._jwtTokensRepository.resetTokenByUserId(userId);

		return updatedToken.token === null;
	}
}
