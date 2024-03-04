import { JWTToken } from '@Entities/JWTToken.entity';
import { IJWTTokensRepository } from '@Interfaces/jwt/IJWTTokensRepository';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { AppLogger } from '@Logger/app.logger';
import { Injectable } from '@nestjs/common';
import { DataSource, DeleteResult, InsertResult, UpdateResult } from 'typeorm';

@Injectable()
export class JWTTokensRepository implements IJWTTokensRepository {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(private readonly _dataSource: DataSource) {}

	public async getById(id: string): Promise<JWTToken | null> {
		const token: JWTToken | null = await this._dataSource
			.createQueryBuilder()
			.select('jwtToken')
			.from(JWTToken, 'jwtToken')
			.where('jwtToken.id = :id', { id })
			.getOne();

		this._logger.successfulDBQuery({
			method: this.getById.name,
			repository: 'JWTTokensRepository',
			data: token,
		});

		return token;
	}

	public async createToken(token: string): Promise<string> {
		const result: InsertResult = await this._dataSource
			.createQueryBuilder()
			.insert()
			.into(JWTToken)
			.values({ token })
			.execute();

		this._logger.successfulDBQuery({
			method: this.createToken.name,
			repository: 'JWTTokensRepository',
			data: result,
		});

		return result.identifiers[0].id;
	}

	public async updateToken(id: string, token: string): Promise<boolean> {
		const updateResult: UpdateResult = await this._dataSource
			.createQueryBuilder()
			.update(JWTToken)
			.set({ token })
			.where('id = :id', { id })
			.execute();

		this._logger.successfulDBQuery({
			method: this.updateToken.name,
			repository: 'JWTTokensRepository',
			data: updateResult,
		});

		return updateResult.affected ? updateResult.affected > 0 : false;
	}

	public async deleteToken(id: string): Promise<boolean> {
		const result: DeleteResult = await this._dataSource
			.createQueryBuilder()
			.delete()
			.from(JWTToken)
			.where('id = :id', { id })
			.execute();

		this._logger.successfulDBQuery({
			method: this.deleteToken.name,
			repository: 'JWTTokensRepository',
			data: result,
		});

		return result.affected ? result.affected > 0 : false;
	}
}
