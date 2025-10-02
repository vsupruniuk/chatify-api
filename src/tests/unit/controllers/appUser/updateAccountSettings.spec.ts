import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { AppUserController } from '@controllers';

import { providers } from '@modules/providers';

import { CustomProviders } from '@enums';

import { IAccountSettingsService } from '@services';

import { User, AccountSettings } from '@entities';

import { users, accountSettings } from '@testMocks';

import { JWTPayloadDto } from '@dtos/jwt';
import {
	UpdateAccountSettingsRequestDto,
	AccountSettingsDto,
} from '@dtos/accountSettings/accountSettings';

describe('App user controller', (): void => {
	let appUserController: AppUserController;
	let accountSettingsService: IAccountSettingsService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [AppUserController],
			providers: [
				JwtService,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				providers.CTF_APP_USER_SERVICE,

				providers.CTF_ACCOUNT_SETTINGS_SERVICE,
				providers.CTF_ACCOUNT_SETTINGS_REPOSITORY,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		appUserController = moduleFixture.get(AppUserController);
		accountSettingsService = moduleFixture.get(CustomProviders.CTF_ACCOUNT_SETTINGS_SERVICE);
	});

	describe('Update account settings', (): void => {
		const userMock: User = users[4];
		const accountSettingsMock: AccountSettings = accountSettings[1];

		const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto = {
			notification: true,
			twoStepVerification: true,
			enterIsSending: false,
		};

		beforeEach((): void => {
			jest.spyOn(accountSettingsService, 'updateAccountSettings').mockResolvedValue(
				plainToInstance(AccountSettingsDto, accountSettingsMock, {
					excludeExtraneousValues: true,
				}),
			);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call update account settings method from account settings service to update user account settings', async (): Promise<void> => {
			await appUserController.updateAccountSettings(
				appUserPayload,
				updateAccountSettingsRequestDto,
			);

			expect(accountSettingsService.updateAccountSettings).toHaveBeenCalledTimes(1);
			expect(accountSettingsService.updateAccountSettings).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				updateAccountSettingsRequestDto,
			);
		});

		it('should return updated settings', async (): Promise<void> => {
			const updatedSettings: AccountSettingsDto = await appUserController.updateAccountSettings(
				appUserPayload,
				updateAccountSettingsRequestDto,
			);

			expect(updatedSettings).toEqual(
				plainToInstance(AccountSettingsDto, accountSettingsMock, {
					excludeExtraneousValues: true,
				}),
			);
		});

		it('should return response as instance of AccountSettingsDto', async (): Promise<void> => {
			const updatedSettings: AccountSettingsDto = await appUserController.updateAccountSettings(
				appUserPayload,
				updateAccountSettingsRequestDto,
			);

			expect(updatedSettings).toBeInstanceOf(AccountSettingsDto);
		});
	});
});
