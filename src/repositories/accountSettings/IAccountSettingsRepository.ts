import { AccountSettings } from '@entities';

import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/accountSettings';

/**
 * Repository interface for account settings related operations in database
 */
export interface IAccountSettingsRepository {
	/**
	 * Accept user id, new values for account settings and set new values to the database
	 * @param userId - user id for searching relevant account settings
	 * @param updateAccountSettingsRequestDto - DTO object with new account settings values
	 * @returns Promise<AccountSettings | null> - updated account settings, or null if select query didn't find settings
	 * @remarks Method using transaction. In case if any operation with DB will fail, all other will not be applied
	 */
	updateAccountSettings(
		userId: string,
		updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettings | null>;
}
