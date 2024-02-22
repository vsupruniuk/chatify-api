import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { JWTToken } from '@Entities/JWTToken.entity';
import { IJWTTokensRepository } from '@Interfaces/jwt/IJWTTokensRepository';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { AppLogger } from '@Logger/app.logger';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DataSource, DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class JWTTokensRepository extends Repository<JWTToken> implements IJWTTokensRepository {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(_dataSource: DataSource) {
		super(JWTToken, _dataSource.createEntityManager());
	}

	public async getById(id: string): Promise<JWTTokenFullDto | null> {
		const token: JWTToken | null = await this.findOne({ where: { id } });

		this._logger.successfulDBQuery({
			method: this.getById.name,
			repository: 'JWTTokensRepository',
			data: token,
		});

		return token
			? plainToInstance(JWTTokenFullDto, token, { excludeExtraneousValues: true })
			: null;
	}

	public async createToken(token: string): Promise<string> {
		const result: InsertResult = await this.insert({ token });

		this._logger.successfulDBQuery({
			method: this.createToken.name,
			repository: 'JWTTokensRepository',
			data: result,
		});

		return result.identifiers[0].id;
	}

	public async updateToken(id: string, token: string): Promise<boolean> {
		const updateResult: UpdateResult = await this.update({ id }, { token });

		this._logger.successfulDBQuery({
			method: this.updateToken.name,
			repository: 'JWTTokensRepository',
			data: updateResult,
		});

		return updateResult.affected ? updateResult.affected > 0 : false;
	}

	public async deleteToken(id: string): Promise<boolean> {
		const result: DeleteResult = await this.delete({ id });

		this._logger.successfulDBQuery({
			method: this.deleteToken.name,
			repository: 'JWTTokensRepository',
			data: result,
		});

		return result.affected ? result.affected > 0 : false;
	}
}
