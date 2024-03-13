import { connectionSource } from '@DB/typeOrmConfig';
import { UpdateAccountSettingsDto } from '@DTO/accountSettings/updateAccountSettings.dto';
import { AccountSettings } from '@Entities/AccountSettings.entity';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IAccountSettingsService } from '@Interfaces/accountSettings/IAccountSettingsService';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { AccountSettingsService } from '@Services/accountSettings.service';
import { accountSettings } from '@TestMocks/AccountSettings/accountSettings';
import SpyInstance = jest.SpyInstance;

describe('accountSettingsService', (): void => {
	let accountSettingsService: IAccountSettingsService;
	let accountSettingsRepository: IAccountSettingsRepository;

	beforeEach((): void => {
		accountSettingsRepository = new AccountSettingsRepository(connectionSource);

		accountSettingsService = new AccountSettingsService(accountSettingsRepository);
	});

	describe('updateAccountSettings', (): void => {
		let updateAccountSettingsMock: SpyInstance;

		const accountSettingsMock: AccountSettings[] = [...accountSettings];
		const existingSettingsId: string = '1';
		const notExistingSettingsId: string = '5';
		const updateAccountSettingsDto: UpdateAccountSettingsDto = {
			notification: true,
			twoStepVerification: false,
			enterIsSend: false,
		};

		beforeEach((): void => {
			updateAccountSettingsMock = jest
				.spyOn(accountSettingsRepository, 'updateAccountSettings')
				.mockImplementation(async (id: string): Promise<boolean> => {
					return accountSettingsMock.some((settings: AccountSettings) => settings.id === id);
				});
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

		it('should call updateAccountSettings method in users repository to update user', async (): Promise<void> => {
			await accountSettingsService.updateAccountSettings(
				existingSettingsId,
				updateAccountSettingsDto,
			);

			expect(updateAccountSettingsMock).toHaveBeenCalledTimes(1);
			expect(updateAccountSettingsMock).toHaveBeenCalledWith(
				existingSettingsId,
				updateAccountSettingsDto,
			);
		});

		it('should return false if user with given id not exist', async (): Promise<void> => {
			const result: boolean = await accountSettingsService.updateAccountSettings(
				notExistingSettingsId,
				updateAccountSettingsDto,
			);

			expect(result).toBe(false);
		});

		it('should return true if user with given id exist', async (): Promise<void> => {
			const result: boolean = await accountSettingsService.updateAccountSettings(
				existingSettingsId,
				updateAccountSettingsDto,
			);

			expect(result).toBe(true);
		});
	});
});
