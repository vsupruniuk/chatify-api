import { Injectable } from '@nestjs/common';

import { DataSource, InsertResult, Repository } from 'typeorm';

import { IStatusesRepository } from '@Interfaces/statuses/IStatusesRepository';
import { Status } from '@Entities/Status.entity';
import { CreateStatusDto } from '@DTO/statuses/CreateStatus.dto';

@Injectable()
export class StatusesRepository extends Repository<Status> implements IStatusesRepository {
	constructor(private _dataSource: DataSource) {
		super(Status, _dataSource.createEntityManager());
	}

	public async createStatus(createStatusDto: CreateStatusDto): Promise<string> {
		const result: InsertResult = await this.insert(createStatusDto);

		return result.identifiers[0].id;
	}
}
