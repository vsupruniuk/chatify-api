import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/UpdateAccountSettingsRequest.dto';
import { AccountSettings } from '@entities/AccountSettings.entity';

/**
 * Interface representing public methods of account settings repository
 */
export interface IAccountSettingsRepository {
	updateAccountSettings(
		userId: string,
		updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettings | null>;
}
