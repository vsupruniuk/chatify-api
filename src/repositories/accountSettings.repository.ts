import { UpdateAccountSettingsDto } from '@DTO/accountSettings/updateAccountSettings.dto';
import { Injectable } from '@nestjs/common';
import { DataSource, InsertResult, UpdateResult } from 'typeorm';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { AccountSettings } from '@Entities/AccountSettings.entity';

@Injectable()
export class AccountSettingsRepository implements IAccountSettingsRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async getById(id: string): Promise<AccountSettings | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('accountSettings')
			.from(AccountSettings, 'accountSettings')
			.where('accountSettings.id = :id', { id })
			.getOne();
	}

	public async createDefaultSettings(): Promise<string> {
		const result: InsertResult = await this._dataSource
			.createQueryBuilder()
			.insert()
			.into(AccountSettings)
			.values({})
			.execute();

		return result.identifiers[0].id;
	}

	public async updateAccountSettings(
		id: string,
		newSettings: Partial<UpdateAccountSettingsDto>,
	): Promise<boolean> {
		const result: UpdateResult = await this._dataSource
			.createQueryBuilder()
			.update(AccountSettings)
			.set(newSettings)
			.where('id = :id', { id })
			.execute();

		return result.affected ? result.affected > 0 : false;
	}
}
