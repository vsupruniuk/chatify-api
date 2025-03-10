import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/accountSettings/UpdateAccountSettingsRequest.dto';
import { AccountSettingsDto } from '@dtos/accountSettings/accountSettings/AccountSettings.dto';

export interface IAccountSettingsService {
	/**
	 * Method for updating app user account settings
	 * @param userId - id of user to search accountSettings
	 * @param updateAccountSettingsRequestDto - new account settings
	 * @returns AccountSettingsDto - updated account settings
	 */
	updateAccountSettings(
		userId: string,
		updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettingsDto>;
}
