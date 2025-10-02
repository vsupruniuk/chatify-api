import { AccountSettings } from '@entities';

import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/accountSettings';

/**
 * Interface representing public methods of account settings repository
 */
export interface IAccountSettingsRepository {
	updateAccountSettings(
		userId: string,
		updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettings | null>;
}
