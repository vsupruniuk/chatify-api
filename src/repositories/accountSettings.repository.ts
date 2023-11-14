import { Injectable } from '@nestjs/common';
import { DataSource, InsertResult, Repository } from 'typeorm';
import { AccountSettings } from '@Entities/AccountSettings.entity';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { User } from '@Entities/User.entity';

@Injectable()
export class AccountSettingsRepository
	extends Repository<AccountSettings>
	implements IAccountSettingsRepository
{
	constructor(private _dataSource: DataSource) {
		super(User, _dataSource.createEntityManager());
	}

	public async createDefaultSettings(): Promise<string> {
		const result: InsertResult = await this.insert(new AccountSettings());

		return result.identifiers[0].id;
	}
}
