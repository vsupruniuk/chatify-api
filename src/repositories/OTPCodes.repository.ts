import { DataSource, InsertResult, Repository } from 'typeorm';
import { OTPCode } from '@Entities/OTPCode.entity';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { CreateOTPCodeDto } from '@DTO/OTPCodes/CreateOTPCode.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OTPCodesRepository extends Repository<OTPCode> implements IOTPCodesRepository {
	constructor(private _dataSource: DataSource) {
		super(OTPCode, _dataSource.createEntityManager());
	}

	public async createOTPCode(createOTPCodeDto: CreateOTPCodeDto): Promise<string> {
		const result: InsertResult = await this.insert(createOTPCodeDto);

		return result.identifiers[0].id;
	}
}
