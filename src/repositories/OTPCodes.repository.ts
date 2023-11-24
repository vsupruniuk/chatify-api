import { DataSource, InsertResult, Repository } from 'typeorm';
import { OTPCode } from '@Entities/OTPCode.entity';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { CreateOTPCodeDto } from '@DTO/OTPCodes/CreateOTPCode.dto';
import { Injectable } from '@nestjs/common';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';

@Injectable()
export class OTPCodesRepository extends Repository<OTPCode> implements IOTPCodesRepository {
	constructor(private _dataSource: DataSource) {
		super(OTPCode, _dataSource.createEntityManager());
	}

	public async createOTPCode(createOTPCodeDto: CreateOTPCodeDto): Promise<string> {
		const result: InsertResult = await this.insert(createOTPCodeDto);

		return result.identifiers[0].id;
	}

	public async getUserOTPCode(userOTPCodeId: string): Promise<OTPCodeResponseDto | null> {
		return undefined;
	}
}
