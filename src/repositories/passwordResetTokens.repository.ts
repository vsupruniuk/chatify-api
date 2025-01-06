import { PasswordResetTokenInfoDto } from '@DTO/passwordResetTokens/passwordResetTokenInfo.dto';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
import { IPasswordResetTokensRepository } from '@Interfaces/passwordResetTokens/IPasswordResetTokensRepository';
import { Injectable } from '@nestjs/common';
import { TPasswordResetTokensGetFields } from '@Types/passwordResetTokens/TPasswordResetTokensGetFields';
import { TUpdatePasswordResetToken } from '@Types/passwordResetTokens/TUpdatePasswordResetToken';
import { DataSource, DeleteResult, InsertResult, UpdateResult } from 'typeorm';

@Injectable()
export class PasswordResetTokensRepository implements IPasswordResetTokensRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async getByField(
		fieldName: TPasswordResetTokensGetFields,
		fieldValue: string,
	): Promise<PasswordResetToken | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('passwordResetToken')
			.from(PasswordResetToken, 'passwordResetToken')
			.where(`passwordResetToken.${fieldName} = :fieldValue`, { fieldValue })
			.getOne();
	}

	public async createToken(tokenDto: PasswordResetTokenInfoDto): Promise<string> {
		const result: InsertResult = await this._dataSource
			.createQueryBuilder()
			.insert()
			.into(PasswordResetToken)
			.values(tokenDto)
			.execute();

		return result.identifiers[0].id;
	}

	public async updateToken(id: string, updateData: TUpdatePasswordResetToken): Promise<boolean> {
		const result: UpdateResult = await this._dataSource
			.createQueryBuilder()
			.update(PasswordResetToken)
			.set(updateData)
			.where('id = :id', { id })
			.execute();

		return result.affected ? result.affected > 0 : false;
	}

	public async deleteToken(id: string): Promise<boolean> {
		const result: DeleteResult = await this._dataSource
			.createQueryBuilder()
			.delete()
			.from(PasswordResetToken)
			.where('id = :id', { id })
			.execute();

		return result.affected ? result.affected > 0 : false;
	}
}
