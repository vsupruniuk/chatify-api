import {
	UpdateAccountSettingsRequestDto,
	AccountSettingsDto,
} from '@dtos/accountSettings/accountSettings';

/**
 * Service interface for actions with account settings
 */
export interface IAccountSettingsService {
	/**
	 * Updates user account settings with new values
	 * @param userId - user id who want to change account settings
	 * @param updateAccountSettingsRequestDto - DTO object with new account settings values
	 * @throws UnprocessableEntityException - if failed to update settings
	 * @returns Promise<AccountSettingsDto> - updated device settings
	 */
	updateAccountSettings(
		userId: string,
		updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettingsDto>;
}
