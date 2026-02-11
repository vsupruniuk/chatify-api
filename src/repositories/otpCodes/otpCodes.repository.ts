import { Injectable } from '@nestjs/common';

import { DataSource, UpdateResult } from 'typeorm';

import { IOtpCodesRepository } from '@repositories';

import { OTPCode } from '@entities';

@Injectable()
export class OtpCodesRepository implements IOtpCodesRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async updateOtpCode(id: string, code: number, expiresAt: string): Promise<OTPCode> {
		const codeUpdateResult: UpdateResult = await this._dataSource
			.createQueryBuilder()
			.update(OTPCode)
			.set(<OTPCode>{ code, expiresAt })
			.where('id = :id', { id })
			.returning('*')
			.execute();

		return (codeUpdateResult.raw as OTPCode[])[0];
	}
}
