import { Injectable } from '@nestjs/common';
import { IAccountSettingsRepository } from '@interfaces/accountSettings/IAccountSettingsRepository';

@Injectable()
export class AccountSettingsRepository implements IAccountSettingsRepository {
	// constructor(private readonly _dataSource: DataSource) {}
	//
	// // TODO check if needed
	// public async getById(id: string): Promise<AccountSettings | null> {
	// 	return await this._dataSource
	// 		.createQueryBuilder()
	// 		.select('accountSettings')
	// 		.from(AccountSettings, 'accountSettings')
	// 		.where('accountSettings.id = :id', { id })
	// 		.getOne();
	// }
	//
	// // TODO check if needed
	// public async createDefaultSettings(): Promise<string> {
	// 	const result: InsertResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.insert()
	// 		.into(AccountSettings)
	// 		.values({})
	// 		.execute();
	//
	// 	return result.identifiers[0].id;
	// }
	//
	// // TODO check if needed
	// public async updateAccountSettings(
	// 	id: string,
	// 	newSettings: Partial<UpdateAccountSettingsDto>,
	// ): Promise<boolean> {
	// 	const result: UpdateResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.update(AccountSettings)
	// 		.set(newSettings)
	// 		.where('id = :id', { id })
	// 		.execute();
	//
	// 	return result.affected ? result.affected > 0 : false;
	// }
}
