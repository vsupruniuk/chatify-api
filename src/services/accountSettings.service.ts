import { UpdateAccountSettingsDto } from '@DTO/accountSettings/updateAccountSettings.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IAccountSettingsService } from '@Interfaces/accountSettings/IAccountSettingsService';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AccountSettingsService implements IAccountSettingsService {
	constructor(
		@Inject(CustomProviders.I_ACCOUNT_SETTINGS_REPOSITORY)
		private readonly _accountSettingsRepository: IAccountSettingsRepository,
	) {}

	public async updateAccountSettings(
		id: string,
		newSettings: Partial<UpdateAccountSettingsDto>,
	): Promise<boolean> {
		return await this._accountSettingsRepository.updateAccountSettings(id, newSettings);
	}
}
