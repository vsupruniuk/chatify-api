import { Injectable } from '@nestjs/common';

import { DataSource, UpdateResult } from 'typeorm';

import { JWTToken, User } from '@entities';

import { IJwtTokensRepository } from '@repositories';

@Injectable()
export class JwtTokensRepository implements IJwtTokensRepository {
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
}
