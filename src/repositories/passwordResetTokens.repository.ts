import { Injectable } from '@nestjs/common';
import { IPasswordResetTokensRepository } from '@interfaces/passwordResetTokens/IPasswordResetTokensRepository';

@Injectable()
export class PasswordResetTokensRepository implements IPasswordResetTokensRepository {
	// constructor(private readonly _dataSource: DataSource) {}
	//
	// // TODO check if needed
	// public async getByField(
	// 	fieldName: TPasswordResetTokensGetFields,
	// 	fieldValue: string,
	// ): Promise<PasswordResetToken | null> {
	// 	return await this._dataSource
	// 		.createQueryBuilder()
	// 		.select('passwordResetToken')
	// 		.from(PasswordResetToken, 'passwordResetToken')
	// 		.where(`passwordResetToken.${fieldName} = :fieldValue`, { fieldValue })
	// 		.getOne();
	// }
	//
	// // TODO check if needed
	// public async createToken(tokenDto: PasswordResetTokenInfoDto): Promise<string> {
	// 	const result: InsertResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.insert()
	// 		.into(PasswordResetToken)
	// 		.values(tokenDto)
	// 		.execute();
	//
	// 	return result.identifiers[0].id;
	// }
	//
	// // TODO check if needed
	// public async updateToken(id: string, updateData: TUpdatePasswordResetToken): Promise<boolean> {
	// 	const result: UpdateResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.update(PasswordResetToken)
	// 		.set(updateData)
	// 		.where('id = :id', { id })
	// 		.execute();
	//
	// 	return result.affected ? result.affected > 0 : false;
	// }
	//
	// // TODO check if needed
	// public async deleteToken(id: string): Promise<boolean> {
	// 	const result: DeleteResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.delete()
	// 		.from(PasswordResetToken)
	// 		.where('id = :id', { id })
	// 		.execute();
	//
	// 	return result.affected ? result.affected > 0 : false;
	// }
}
