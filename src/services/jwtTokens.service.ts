import { IJWTTokensService } from '@interfaces/jwt/IJWTTokensService';

export class JwtTokensService implements IJWTTokensService {
	constructor() // private readonly _jwtService: JwtService, // @Inject(JwtService)
	//
	// @Inject(CustomProviders.CTF_JWT_TOKENS_REPOSITORY)
	// private readonly _jwtTokensRepository: IJWTTokensRepository,
	{}

	// // TODO check if needed
	// public async generateAccessToken(payload: JWTPayloadDto): Promise<string> {
	// 	return await this._jwtService.signAsync(payload, {
	// 		secret: process.env.JWT_ACCESS_TOKEN_SECRET,
	// 		expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN),
	// 	});
	// }
	//
	// // TODO check if needed
	// public async generateRefreshToken(payload: JWTPayloadDto): Promise<string> {
	// 	return await this._jwtService.signAsync(payload, {
	// 		secret: process.env.JWT_REFRESH_TOKEN_SECRET,
	// 		expiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN),
	// 	});
	// }
	//
	// // TODO check if needed
	// public async verifyAccessToken(token: string): Promise<JWTPayloadDto | null> {
	// 	try {
	// 		return await this._jwtService.verifyAsync<JWTPayloadDto>(token, {
	// 			secret: process.env.JWT_ACCESS_TOKEN_SECRET,
	// 		});
	// 	} catch (err) {
	// 		return null;
	// 	}
	// }
	//
	// // TODO check if needed
	// public async verifyRefreshToken(token: string): Promise<JWTPayloadDto | null> {
	// 	try {
	// 		return await this._jwtService.verifyAsync<JWTPayloadDto>(token, {
	// 			secret: process.env.JWT_REFRESH_TOKEN_SECRET,
	// 		});
	// 	} catch (err) {
	// 		return null;
	// 	}
	// }
	//
	// // TODO check if needed
	// public async getById(id: string): Promise<JWTTokenFullDto | null> {
	// 	const token: JWTToken | null = await this._jwtTokensRepository.getById(id);
	//
	// 	return token
	// 		? plainToInstance(JWTTokenFullDto, token, { excludeExtraneousValues: true })
	// 		: null;
	// }
	//
	// // TODO check if needed
	// public async saveRefreshToken(id: string | null, token: string): Promise<string> {
	// 	const existingToken: JWTTokenFullDto | null = id
	// 		? await this._jwtTokensRepository.getById(id)
	// 		: null;
	//
	// 	if (!existingToken || !id) {
	// 		return await this._jwtTokensRepository.createToken(token);
	// 	} else {
	// 		await this._jwtTokensRepository.updateToken(id, token);
	//
	// 		return id;
	// 	}
	// }
	//
	// // TODO check if needed
	// public async deleteToken(id: string): Promise<boolean> {
	// 	return await this._jwtTokensRepository.deleteToken(id);
	// }
}
