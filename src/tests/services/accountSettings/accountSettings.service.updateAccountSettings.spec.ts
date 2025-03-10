import { IAccountSettingsService } from '@services/accountSettings/IAccountSettingsService';
import { IAccountSettingsRepository } from '@repositories/accountSettings/IAccountSettingsRepository';
import { AccountSettingsRepository } from '@repositories/accountSettings/accountSettings.repository';
import { connectionSource } from '@db/typeOrmConfig';
import { AccountSettingsService } from '@services/accountSettings/accountSettings.service';
import SpyInstance = jest.SpyInstance;
import { AccountSettings } from '@entities/AccountSettings.entity';
import { accountSettings } from '@testMocks/AccountSettings/accountSettings';
import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/UpdateAccountSettingsRequest.dto';

describe.skip('accountSettingsService', (): void => {
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
		const updateAccountSettingsDto: UpdateAccountSettingsRequestDto = {
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
