import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { JWTToken } from '@Entities/JWTToken.entity';
import { IJWTTokensRepository } from '@Interfaces/jwt/IJWTTokensRepository';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DataSource, DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class JWTTokensRepository extends Repository<JWTToken> implements IJWTTokensRepository {
	constructor(_dataSource: DataSource) {
		super(JWTToken, _dataSource.createEntityManager());
	}

	public async getById(id: string): Promise<JWTTokenFullDto | null> {
		const token: JWTToken | null = await this.findOne({ where: { id } });

		return token
			? plainToInstance(JWTTokenFullDto, token, { excludeExtraneousValues: true })
			: null;
	}

	public async createToken(token: string): Promise<string> {
		const result: InsertResult = await this.insert({ token });

		return result.identifiers[0].id;
	}

	public async updateToken(id: string, token: string): Promise<boolean> {
		const updateResult: UpdateResult = await this.update({ id }, { token });

		return updateResult.affected ? updateResult.affected > 0 : false;
	}

	public async deleteToken(id: string): Promise<boolean> {
		const result: DeleteResult = await this.delete({ id });

		return result.affected ? result.affected > 0 : false;
	}
}
