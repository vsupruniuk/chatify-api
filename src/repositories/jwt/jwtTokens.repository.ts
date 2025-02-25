import { Injectable } from '@nestjs/common';
import { IJWTTokensRepository } from '@repositories/jwt/IJWTTokensRepository';
import { DataSource, UpdateResult } from 'typeorm';
import { JWTToken } from '@entities/JWTToken.entity';
import { User } from '@entities/User.entity';

@Injectable()
export class JwtTokensRepository implements IJWTTokensRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async updateToken(id: string, token: string): Promise<JWTToken> {
		const jwtTokenUpdateResult: UpdateResult = await this._dataSource
			.createQueryBuilder()
			.update(JWTToken)
			.set({ token })
			.where('id = :id', { id })
			.returning('*')
			.execute();

		return jwtTokenUpdateResult.raw[0] as JWTToken;
	}

	public async resetTokenByUserId(userId: string): Promise<JWTToken> {
		const tokenByUserIdSubQuery: string = this._dataSource
			.createQueryBuilder()
			.subQuery()
			.select('jwtToken.id')
			.from(JWTToken, 'jwtToken')
			.innerJoin(User, 'user', 'user.jwt_token_id = jwtToken.id')
			.where('user.id = :userId', { userId })
			.getQuery();

		const updateTokenResult: UpdateResult = await this._dataSource
			.createQueryBuilder()
			.update(JWTToken)
			.set(<JWTToken>{ token: null })
			.where(`id IN (${tokenByUserIdSubQuery})`)
			.setParameters({ userId })
			.returning('*')
			.execute();

		return updateTokenResult.raw[0] as JWTToken;
	}

	//
	// // TODO check if needed
	// public async getById(id: string): Promise<JWTToken | null> {
	// 	return await this._dataSource
	// 		.createQueryBuilder()
	// 		.select('jwtToken')
	// 		.from(JWTToken, 'jwtToken')
	// 		.where('jwtToken.id = :id', { id })
	// 		.getOne();
	// }

	//
	// // TODO check if needed
	// public async updateToken(id: string, token: string): Promise<boolean> {
	// 	const updateResult: UpdateResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.update(JWTToken)
	// 		.set({ token })
	// 		.where('id = :id', { id })
	// 		.execute();
	//
	// 	return updateResult.affected ? updateResult.affected > 0 : false;
	// }
	//
	// // TODO check if needed
	// public async deleteToken(id: string): Promise<boolean> {
	// 	const result: DeleteResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.delete()
	// 		.from(JWTToken)
	// 		.where('id = :id', { id })
	// 		.execute();
	//
	// 	return result.affected ? result.affected > 0 : false;
	// }
}
