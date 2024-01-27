import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { JWTToken } from '@Entities/JWTToken.entity';
import { IJWTTokensRepository } from '@Interfaces/jwt/IJWTTokensRepository';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DataSource, InsertResult, Repository } from 'typeorm';

@Injectable()
export class JWTTokensRepository extends Repository<JWTToken> implements IJWTTokensRepository {
	constructor(private _dataSource: DataSource) {
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
}
