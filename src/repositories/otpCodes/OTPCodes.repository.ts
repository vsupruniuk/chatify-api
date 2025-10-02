import { Injectable } from '@nestjs/common';

import { DataSource, UpdateResult } from 'typeorm';

import { IOTPCodesRepository } from '@repositories';

import { OTPCode } from '@entities';

@Injectable()
export class OTPCodesRepository implements IOTPCodesRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async update(id: string, code: number, expiresAt: string): Promise<OTPCode> {
		const codeUpdateResult: UpdateResult = await this._dataSource
			.createQueryBuilder()
			.update(OTPCode)
			.set(<OTPCode>{ code, expiresAt })
			.where('id = :id', { id })
			.returning('*')
			.execute();

		return codeUpdateResult.raw[0] as OTPCode;
	}
}
