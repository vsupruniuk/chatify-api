import { Injectable } from '@nestjs/common';

import { IOTPCodesRepository } from '@repositories/otpCodes/IOTPCodesRepository';
import { DataSource, UpdateResult } from 'typeorm';
import { OTPCode } from '@entities/OTPCode.entity';

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
