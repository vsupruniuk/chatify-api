import { Injectable } from '@nestjs/common';

import { DataSource, EntityManager, UpdateResult } from 'typeorm';

import { AccountSettings, User } from '@entities';

import { IAccountSettingsRepository } from '@repositories';

import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/accountSettings';

@Injectable()
export class AccountSettingsRepository implements IAccountSettingsRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async updateAccountSettings(
		userId: string,
		updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettings | null> {
		return await this._dataSource.transaction(
			async (transactionalEntityManager: EntityManager): Promise<AccountSettings | null> => {
				const settingsByUserIdSubQuery: string = transactionalEntityManager
					.createQueryBuilder()
					.subQuery()
					.select('accountSettings.id')
					.from(AccountSettings, 'accountSettings')
					.innerJoin(User, 'user', 'user.account_settings_id = accountSettings.id')
					.where('user.id = :userId', { userId })
					.getQuery();

				const updateResult: UpdateResult = await transactionalEntityManager
					.createQueryBuilder()
					.update(AccountSettings)
					.set(updateAccountSettingsRequestDto)
					.where(`id IN (${settingsByUserIdSubQuery})`)
					.setParameters({ userId })
					.returning('*')
					.execute();

				return transactionalEntityManager
					.createQueryBuilder()
					.select('accountSettings')
					.from(AccountSettings, 'accountSettings')
					.where('accountSettings.id = :accountSettingsId', {
						accountSettingsId: updateResult.raw[0].id,
					})
					.getOne();
			},
		);
	}
}
