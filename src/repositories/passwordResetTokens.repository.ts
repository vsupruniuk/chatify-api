import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { PasswordResetTokenInfoDto } from '@DTO/passwordResetTokens/passwordResetTokenInfo.dto';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { IPasswordResetTokensRepository } from '@Interfaces/passwordResetTokens/IPasswordResetTokensRepository';
import { AppLogger } from '@Logger/app.logger';
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
	private readonly _logger: IAppLogger = new AppLogger();

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

		this._logger.successfulDBQuery({
			method: this.getByField.name,
			repository: 'PasswordResetTokensRepository',
			data: token,
		});

		return token
			? plainToInstance(PasswordResetTokenDto, token, { excludeExtraneousValues: true })
			: null;
	}

	public async createToken(tokenDto: PasswordResetTokenInfoDto): Promise<string> {
		const result: InsertResult = await this.insert(tokenDto);

		this._logger.successfulDBQuery({
			method: this.createToken.name,
			repository: 'PasswordResetTokensRepository',
			data: result,
		});

		return result.identifiers[0].id;
	}

	public async updateToken(id: string, updateData: TUpdatePasswordResetToken): Promise<boolean> {
		const result: UpdateResult = await this.update({ id }, updateData);

		this._logger.successfulDBQuery({
			method: this.updateToken.name,
			repository: 'PasswordResetTokensRepository',
			data: result,
		});

		return result.affected ? result.affected > 0 : false;
	}

	public async deleteToken(id: string): Promise<boolean> {
		const result: DeleteResult = await this.delete({ id });

		this._logger.successfulDBQuery({
			method: this.deleteToken.name,
			repository: 'PasswordResetTokensRepository',
			data: result,
		});

		return result.affected ? result.affected > 0 : false;
	}
}
