import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
import { IPasswordResetTokensRepository } from '@Interfaces/passwordResetTokens/IPasswordResetTokensRepository';
import { Injectable } from '@nestjs/common';
import { TPasswordResetTokensGetFields } from '@Types/passwordResetTokens/TPasswordResetTokensGetFields';
import { TUpdatePasswordResetToken } from '@Types/passwordResetTokens/TUpdatePasswordResetToken';
import { plainToInstance } from 'class-transformer';
import { DataSource, DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class PasswordResetTokensRepository
	extends Repository<PasswordResetToken>
	implements IPasswordResetTokensRepository
{
	constructor(_dataSource: DataSource) {
		super(PasswordResetToken, _dataSource.createEntityManager());
	}

	public async getByField(
		fieldName: TPasswordResetTokensGetFields,
		fieldValue: string,
	): Promise<PasswordResetTokenDto | null> {
		const token: PasswordResetToken | null = await this.findOne({
			where: { [fieldName]: fieldValue },
		});

		return token
			? plainToInstance(PasswordResetTokenDto, token, { excludeExtraneousValues: true })
			: null;
	}

	public async createToken(tokenDto: Omit<PasswordResetTokenDto, 'id'>): Promise<string> {
		const result: InsertResult = await this.insert(tokenDto);

		return result.identifiers[0].id;
	}

	public async updateToken(id: string, updateData: TUpdatePasswordResetToken): Promise<boolean> {
		const result: UpdateResult = await this.update({ id }, updateData);

		return result.affected ? result.affected > 0 : false;
	}

	public async deleteToken(id: string): Promise<boolean> {
		const result: DeleteResult = await this.delete({ id });

		return result.affected ? result.affected > 0 : false;
	}
}
