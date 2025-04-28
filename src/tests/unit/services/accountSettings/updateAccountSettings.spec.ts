import { AccountSettingsService } from '@services/accountSettings/accountSettings.service';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { AccountSettings } from '@entities/AccountSettings.entity';
import { accountSettings } from '@testMocks/AccountSettings/accountSettings';
import { AccountSettingsRepository } from '@repositories/accountSettings/accountSettings.repository';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { users } from '@testMocks/User/users';
import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/accountSettings/UpdateAccountSettingsRequest.dto';
import { TransformHelper } from '@helpers/transform.helper';
import { AccountSettingsDto } from '@dtos/accountSettings/accountSettings/AccountSettings.dto';
import { UnprocessableEntityException } from '@nestjs/common';

describe('Account settings service', (): void => {
	let accountSettingsService: AccountSettingsService;
	let accountSettingsRepository: AccountSettingsRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AccountSettingsService,

				providers.CTF_ACCOUNT_SETTINGS_REPOSITORY,
				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: new QueryBuilderMock() },
			],
		})
			.overrideProvider(DataSource)
			.useValue({})
			.compile();

		accountSettingsService = moduleFixture.get(AccountSettingsService);
		accountSettingsRepository = moduleFixture.get(CustomProviders.CTF_ACCOUNT_SETTINGS_REPOSITORY);
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

			jest.spyOn(TransformHelper, 'toTargetDto');
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(accountSettingsService.updateAccountSettings).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(accountSettingsService.updateAccountSettings).toBeInstanceOf(Function);
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

		it('should call to target dto method from transform helper to transform response to appropriate dto', async (): Promise<void> => {
			await accountSettingsService.updateAccountSettings(
				userIdMock,
				updateAccountSettingsRequestDtoMock,
			);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(1);
			expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(
				1,
				AccountSettingsDto,
				accountSettingsMock,
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

			expect(accountSettings.enterIsSending).toBe(accountSettingsMock.enterIsSending);
			expect(accountSettings.twoStepVerification).toBe(accountSettingsMock.twoStepVerification);
			expect(accountSettings.notification).toBe(accountSettingsMock.notification);
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
