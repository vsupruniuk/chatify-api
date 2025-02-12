import { Injectable } from '@nestjs/common';

import { IOTPCodesRepository } from '@interfaces/OTPCodes/IOTPCodesRepository';

@Injectable()
export class OTPCodesRepository implements IOTPCodesRepository {
	// constructor(private readonly _dataSource: DataSource) {}
	//
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
	//
	// // TODO check if needed
	// public async updateOTPCode(
	// 	userOTPCodeId: string,
	// 	updateOTPCodeDto: Partial<UpdateOTPCodeDto>,
	// ): Promise<boolean> {
	// 	const updateResult: UpdateResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.update(OTPCode)
	// 		.set(updateOTPCodeDto)
	// 		.where('id = :userOTPCodeId', { userOTPCodeId })
	// 		.execute();
	//
	// 	return updateResult.affected ? updateResult.affected > 0 : false;
	// }
}
