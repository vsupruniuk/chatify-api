import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { IAccountSettingsService } from '@services/accountSettings/IAccountSettingsService';
import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/UpdateAccountSettingsRequest.dto';
import { AccountSettingsDto } from '@dtos/accountSettings/AccountSettings.dto';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IAccountSettingsRepository } from '@repositories/accountSettings/IAccountSettingsRepository';
import { AccountSettings } from '@entities/AccountSettings.entity';
import { TransformHelper } from '@helpers/transform.helper';

@Injectable()
export class AccountSettingsService implements IAccountSettingsService {
	constructor(
		@Inject(CustomProviders.CTF_ACCOUNT_SETTINGS_REPOSITORY)
		private readonly _accountSettingsRepository: IAccountSettingsRepository,
	) {}

	public async updateAccountSettings(
		userId: string,
		updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettingsDto> {
		const accountSettings: AccountSettings | null =
			await this._accountSettingsRepository.updateAccountSettings(
				userId,
				updateAccountSettingsRequestDto,
			);

		if (!accountSettings) {
			throw new UnprocessableEntityException('Failed to update account settings, please try again');
		}

		return TransformHelper.toTargetDto(AccountSettingsDto, accountSettings);
	}
}
