import { Injectable } from '@nestjs/common';

import { DataSource, InsertResult, UpdateResult } from 'typeorm';

import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { OTPCode } from '@Entities/OTPCode.entity';
import { CreateOTPCodeDto } from '@DTO/OTPCodes/CreateOTPCode.dto';
import { UpdateOTPCodeDto } from '@DTO/OTPCodes/UpdateOTPCode.dto';

@Injectable()
export class OTPCodesRepository implements IOTPCodesRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async createOTPCode(createOTPCodeDto: CreateOTPCodeDto): Promise<string> {
		const result: InsertResult = await this._dataSource
			.createQueryBuilder()
			.insert()
			.into(OTPCode)
			.values(createOTPCodeDto)
			.execute();

		return result.identifiers[0].id;
	}

	public async getUserOTPCodeById(userOTPCodeId: string): Promise<OTPCode | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('otpCode')
			.from(OTPCode, 'otpCode')
			.where('otpCode.id = :userOTPCodeId', { userOTPCodeId })
			.getOne();
	}

	public async updateOTPCode(
		userOTPCodeId: string,
		updateOTPCodeDto: Partial<UpdateOTPCodeDto>,
	): Promise<boolean> {
		const updateResult: UpdateResult = await this._dataSource
			.createQueryBuilder()
			.update(OTPCode)
			.set(updateOTPCodeDto)
			.where('id = :userOTPCodeId', { userOTPCodeId })
			.execute();

		return updateResult.affected ? updateResult.affected > 0 : false;
	}
}
