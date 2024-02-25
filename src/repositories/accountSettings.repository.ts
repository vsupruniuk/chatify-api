import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { AppLogger } from '@Logger/app.logger';
import { Injectable } from '@nestjs/common';
import { DataSource, InsertResult } from 'typeorm';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { AccountSettings } from '@Entities/AccountSettings.entity';

@Injectable()
export class AccountSettingsRepository implements IAccountSettingsRepository {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(private readonly _dataSource: DataSource) {}

	public async createDefaultSettings(): Promise<string> {
		const result: InsertResult = await this._dataSource
			.createQueryBuilder()
			.insert()
			.into(AccountSettings)
			.values({})
			.execute();

		this._logger.successfulDBQuery({
			method: this.createDefaultSettings.name,
			repository: 'JWTTokensRepository',
			data: result,
		});

		return result.identifiers[0].id;
	}
}
