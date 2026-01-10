import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { AccountSettingsService } from '@services';

import { providers } from '@modules/providers';

import { AccountSettings } from '@entities';

import { accountSettings, users } from '@testMocks';

import { CustomProvider } from '@enums';

import {
	UpdateAccountSettingsRequestDto,
	AccountSettingsDto,
} from '@dtos/accountSettings/accountSettings';

import { IAccountSettingsRepository } from '@repositories';

describe('Account settings service', (): void => {
	let accountSettingsService: AccountSettingsService;
	let accountSettingsRepository: IAccountSettingsRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AccountSettingsService,

				providers.CTF_ACCOUNT_SETTINGS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		accountSettingsService = moduleFixture.get(AccountSettingsService);
		accountSettingsRepository = moduleFixture.get(CustomProvider.CTF_ACCOUNT_SETTINGS_REPOSITORY);
	});

	describe('Update account settings', (): void => {
		const accountSettingsMock: AccountSettings = accountSettings[1];
		const userIdMock: string = users[0].id;

		const updateAccountSettingsRequestDtoMock: UpdateAccountSettingsRequestDto = {
			notification: accountSettingsMock.notification,
			enterIsSending: accountSettingsMock.enterIsSending,
			twoStepVerification: accountSettingsMock.twoStepVerification,
		};

		beforeEach((): void => {
			jest
				.spyOn(accountSettingsRepository, 'updateAccountSettings')
				.mockResolvedValue(accountSettingsMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call update account settings method from account settings repository to update user account settings', async (): Promise<void> => {
			await accountSettingsService.updateAccountSettings(
				userIdMock,
				updateAccountSettingsRequestDtoMock,
			);

			expect(accountSettingsRepository.updateAccountSettings).toHaveBeenCalledTimes(1);
			expect(accountSettingsRepository.updateAccountSettings).toHaveBeenNthCalledWith(
				1,
				userIdMock,
				updateAccountSettingsRequestDtoMock,
			);
		});

		it('should throw unprocessable entity exception if account settings repository returned null', async (): Promise<void> => {
			jest.spyOn(accountSettingsRepository, 'updateAccountSettings').mockResolvedValue(null);

			await expect(
				accountSettingsService.updateAccountSettings(
					userIdMock,
					updateAccountSettingsRequestDtoMock,
				),
			).rejects.toThrow(UnprocessableEntityException);
		});

		it('should return updated account settings', async (): Promise<void> => {
			const accountSettings: AccountSettingsDto =
				await accountSettingsService.updateAccountSettings(
					userIdMock,
					updateAccountSettingsRequestDtoMock,
				);

			expect(accountSettings).toEqual(
				plainToInstance(AccountSettingsDto, accountSettingsMock, { excludeExtraneousValues: true }),
			);
		});

		it('should return response as instance of AccountSettingsDto', async (): Promise<void> => {
			const accountSettings: AccountSettingsDto =
				await accountSettingsService.updateAccountSettings(
					userIdMock,
					updateAccountSettingsRequestDtoMock,
				);

			expect(accountSettings).toBeInstanceOf(AccountSettingsDto);
		});
	});
});
