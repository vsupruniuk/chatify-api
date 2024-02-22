import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { AppLogger } from '@Logger/app.logger';
import { Injectable } from '@nestjs/common';

import { DataSource, InsertResult, Repository, UpdateResult } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { OTPCode } from '@Entities/OTPCode.entity';
import { CreateOTPCodeDto } from '@DTO/OTPCodes/CreateOTPCode.dto';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { UpdateOTPCodeDto } from '@DTO/OTPCodes/UpdateOTPCode.dto';

@Injectable()
export class OTPCodesRepository extends Repository<OTPCode> implements IOTPCodesRepository {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(_dataSource: DataSource) {
		super(OTPCode, _dataSource.createEntityManager());
	}

	public async createOTPCode(createOTPCodeDto: CreateOTPCodeDto): Promise<string> {
		const result: InsertResult = await this.insert(createOTPCodeDto);

		this._logger.successfulDBQuery({
			method: this.createOTPCode.name,
			repository: 'OTPCodesRepository',
			data: result,
		});

		return result.identifiers[0].id;
	}

	public async getUserOTPCodeById(userOTPCodeId: string): Promise<OTPCodeResponseDto | null> {
		const otpCode: OTPCode | null = await this.findOne({ where: { id: userOTPCodeId } });

		this._logger.successfulDBQuery({
			method: this.getUserOTPCodeById.name,
			repository: 'OTPCodesRepository',
			data: otpCode,
		});

		return otpCode
			? plainToInstance(OTPCodeResponseDto, otpCode, { excludeExtraneousValues: true })
			: null;
	}

	public async updateOTPCode(
		userOTPCodeId: string,
		updateOTPCodeDto: Partial<UpdateOTPCodeDto>,
	): Promise<boolean> {
		const updateResult: UpdateResult = await this.update({ id: userOTPCodeId }, updateOTPCodeDto);

		this._logger.successfulDBQuery({
			method: this.updateOTPCode.name,
			repository: 'OTPCodesRepository',
			data: updateResult,
		});

		return updateResult.affected ? updateResult.affected > 0 : false;
	}
}
