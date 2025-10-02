import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IJWTTokensService } from '@services';

import { JWTPayloadDto } from '@dtos/jwt';

import { CustomProviders } from '@enums';

import { IJWTTokensRepository } from '@repositories';

import { JWTToken } from '@entities';

export class JwtTokensService implements IJWTTokensService {
	constructor(
		private readonly _jwtService: JwtService,

		@Inject(CustomProviders.CTF_JWT_TOKENS_REPOSITORY)
		private readonly _jwtTokensRepository: IJWTTokensRepository,
	) {}

	public async generateAccessToken(payload: JWTPayloadDto): Promise<string> {
		return await this._jwtService.signAsync(payload, {
			secret: process.env.JWT_ACCESS_TOKEN_SECRET,
			expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN),
		});
	}

	public async generateRefreshToken(payload: JWTPayloadDto): Promise<string> {
		return await this._jwtService.signAsync(payload, {
			secret: process.env.JWT_REFRESH_TOKEN_SECRET,
			expiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN),
		});
	}

	public async saveRefreshToken(id: string, token: string): Promise<void> {
		await this._jwtTokensRepository.updateToken(id, token);
	}

	public async verifyAccessToken(token: string): Promise<JWTPayloadDto | null> {
		try {
			return await this._jwtService.verifyAsync<JWTPayloadDto>(token, {
				secret: process.env.JWT_ACCESS_TOKEN_SECRET,
			});
		} catch (err) {
			return null;
		}
	}

	public async verifyRefreshToken(token: string): Promise<JWTPayloadDto | null> {
		try {
			return await this._jwtService.verifyAsync<JWTPayloadDto>(token, {
				secret: process.env.JWT_REFRESH_TOKEN_SECRET,
			});
		} catch (err) {
			return null;
		}
	}

	public async resetUserToken(userId: string): Promise<boolean> {
		const updatedToken: JWTToken = await this._jwtTokensRepository.resetTokenByUserId(userId);

		return updatedToken.token === null;
	}
}
