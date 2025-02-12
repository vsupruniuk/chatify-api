import { Injectable } from '@nestjs/common';
import { IAccountSettingsService } from '@interfaces/accountSettings/IAccountSettingsService';

@Injectable()
export class AccountSettingsService implements IAccountSettingsService {
	constructor() // @Inject(CustomProviders.CTF_ACCOUNT_SETTINGS_REPOSITORY)
	// private readonly _accountSettingsRepository: IAccountSettingsRepository,
	{}

	// // TODO check if needed
	// public async updateAccountSettings(
	// 	id: string,
	// 	newSettings: Partial<UpdateAccountSettingsDto>,
	// ): Promise<boolean> {
	// 	return await this._accountSettingsRepository.updateAccountSettings(id, newSettings);
	// }
}
