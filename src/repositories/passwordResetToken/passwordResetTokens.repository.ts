import { Injectable } from '@nestjs/common';

import { DataSource, UpdateResult } from 'typeorm';

import { IPasswordResetTokensRepository } from '@repositories';

import { PasswordResetToken } from '@entities';

@Injectable()
export class PasswordResetTokensRepository implements IPasswordResetTokensRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async updateToken(
		id: string,
		token: string,
		expiresAt: string,
	): Promise<PasswordResetToken> {
		const tokenUpdateResult: UpdateResult = await this._dataSource
			.createQueryBuilder()
			.update(PasswordResetToken)
			.set(<PasswordResetToken>{ token, expiresAt })
			.where('id = :id', { id })
			.returning('*')
			.execute();

		return tokenUpdateResult.raw[0] as PasswordResetToken;
	}
}
