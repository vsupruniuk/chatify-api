import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';

import { IAccountSettingsService } from '@services';

import {
	UpdateAccountSettingsRequestDto,
	AccountSettingsDto,
} from '@dtos/accountSettings/accountSettings';

import { CustomProvider } from '@enums';

import { IAccountSettingsRepository } from '@repositories';

import { AccountSettings } from '@entities';

import { TransformHelper } from '@helpers';

@Injectable()
export class AccountSettingsService implements IAccountSettingsService {
	constructor(
		@Inject(CustomProvider.CTF_ACCOUNT_SETTINGS_REPOSITORY)
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
