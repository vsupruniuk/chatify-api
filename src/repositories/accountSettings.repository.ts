import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { AppLogger } from '@Logger/app.logger';
import { Injectable } from '@nestjs/common';

import { DataSource, InsertResult, Repository } from 'typeorm';

import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { AccountSettings } from '@Entities/AccountSettings.entity';

@Injectable()
export class AccountSettingsRepository
	extends Repository<AccountSettings>
	implements IAccountSettingsRepository
{
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(_dataSource: DataSource) {
		super(AccountSettings, _dataSource.createEntityManager());
	}

	public async createDefaultSettings(): Promise<string> {
		const result: InsertResult = await this.insert(new AccountSettings());

		this._logger.successfulDBQuery({
			method: this.createDefaultSettings.name,
			repository: 'JWTTokensRepository',
			data: result,
		});

		return result.identifiers[0].id;
	}
}
