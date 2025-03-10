import {
	BadRequestException,
	Inject,
	Injectable,
	UnauthorizedException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { IAccountSettingsService } from '@services/accountSettings/IAccountSettingsService';
import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/accountSettings/UpdateAccountSettingsRequest.dto';
import { AccountSettingsDto } from '@dtos/accountSettings/accountSettings/AccountSettings.dto';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IAccountSettingsRepository } from '@repositories/accountSettings/IAccountSettingsRepository';
import { AccountSettings } from '@entities/AccountSettings.entity';
import { TransformHelper } from '@helpers/transform.helper';
import { IUsersService } from '@services/users/IUsersService';
import { UserDto } from '@dtos/users/UserDto';
import { FileHelper } from '@helpers/file.helper';

@Injectable()
export class AccountSettingsService implements IAccountSettingsService {
	constructor(
		@Inject(CustomProviders.CTF_ACCOUNT_SETTINGS_REPOSITORY)
		private readonly _accountSettingsRepository: IAccountSettingsRepository,

		@Inject(CustomProviders.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,
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

	public async deleteUserAvatar(userId: string): Promise<void> {
		const user: UserDto | null = await this._usersService.getById(userId);

		if (!user) {
			throw new UnauthorizedException('Please login to perform this action');
		}

		if (!user.avatarUrl) {
			throw new BadRequestException('User does not have an avatar');
		}

		FileHelper.deleteFile(user.avatarUrl);

		await this._usersService.updateUserAvatarUrl(userId, null);
	}
}
