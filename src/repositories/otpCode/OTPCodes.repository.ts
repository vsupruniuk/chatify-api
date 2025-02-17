import { Injectable } from '@nestjs/common';

import { IOTPCodesRepository } from '@repositories/otpCode/IOTPCodesRepository';
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

	// // TODO check if needed
	// public async createOTPCode(createOTPCodeDto: CreateOTPCodeDto): Promise<string> {
	// 	const result: InsertResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.insert()
	// 		.into(OTPCode)
	// 		.values(createOTPCodeDto)
	// 		.execute();
	//
	// 	return result.identifiers[0].id;
	// }
	//
	// // TODO check if needed
	// public async getUserOTPCodeById(userOTPCodeId: string): Promise<OTPCode | null> {
	// 	return await this._dataSource
	// 		.createQueryBuilder()
	// 		.select('otpCode')
	// 		.from(OTPCode, 'otpCode')
	// 		.where('otpCode.id = :userOTPCodeId', { userOTPCodeId })
	// 		.getOne();
	// }
}
