import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IJWTTokensRepository } from '@Interfaces/jwt/IJWTTokensRepository';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export class JwtTokensService implements IJWTTokensService {
	constructor(
		@Inject(JwtService)
		private readonly _jwtService: JwtService,

		@Inject(CustomProviders.I_JWT_TOKENS_REPOSITORY)
		private readonly _jwtTokensRepository: IJWTTokensRepository,
	) {}

	public async generateAccessToken(payload: JWTPayloadDto): Promise<string> {
		return await this._jwtService.signAsync(payload, {
			secret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
			expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN) || 0,
		});
	}

	public async generateRefreshToken(payload: JWTPayloadDto): Promise<string> {
		return await this._jwtService.signAsync(payload, {
			secret: process.env.JWT_REFRESH_TOKEN_SECRET || '',
			expiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) || 0,
		});
	}

	public async verifyAccessToken(token: string): Promise<JWTPayloadDto | null> {
		try {
			return await this._jwtService.verifyAsync<JWTPayloadDto>(token, {
				secret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
			});
		} catch (err) {
			return null;
		}
	}

	public async verifyRefreshToken(token: string): Promise<JWTPayloadDto | null> {
		try {
			return await this._jwtService.verifyAsync<JWTPayloadDto>(token, {
				secret: process.env.JWT_REFRESH_TOKEN_SECRET || '',
			});
		} catch (err) {
			return null;
		}
	}

	public async getById(id: string): Promise<JWTTokenFullDto | null> {
		return await this._jwtTokensRepository.getById(id);
	}

	public async saveRefreshToken(id: string | null, token: string): Promise<string> {
		const existingToken: JWTTokenFullDto | null = id
			? await this._jwtTokensRepository.getById(id)
			: null;

		if (!existingToken || !id) {
			return await this._jwtTokensRepository.createToken(token);
		} else {
			await this._jwtTokensRepository.updateToken(id, token);

			return id;
		}
	}

	public async deleteToken(id: string): Promise<boolean> {
		return await this._jwtTokensRepository.deleteToken(id);
	}
}
