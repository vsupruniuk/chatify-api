import { DataSource } from 'typeorm';
import { AccountSettings } from '@entities/AccountSettings.entity';
import { AccountSettingsRepository } from '@repositories/accountSettings.repository';
import { accountSettings } from '@testMocks/AccountSettings/accountSettings';

describe.skip('accountSettingsRepository', (): void => {
	let accountSettingsRepository: AccountSettingsRepository;

	let resolvedValue: AccountSettings | null = null;

	const selectMock: jest.Mock = jest.fn().mockReturnThis();
	const fromMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const getOneMock: jest.Mock = jest
		.fn()
		.mockImplementation(async (): Promise<AccountSettings | null> => resolvedValue);

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				select: selectMock,
				from: fromMock,
				where: whereMock,
				getOne: getOneMock,
			};
		}),
	};

	beforeEach((): void => {
		accountSettingsRepository = new AccountSettingsRepository(dataSourceMock);
	});

	describe('getById', (): void => {
		const accountSettingsMock: AccountSettings[] = [...accountSettings];
		const existingAccountSettingsId: string = '1';
		const notExistingAccountSettingsId: string = '5';

		beforeEach((): void => {
			resolvedValue = null;
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(accountSettingsRepository.getById).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(accountSettingsRepository.getById).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query and find user account settings id', async (): Promise<void> => {
			await accountSettingsRepository.getById(existingAccountSettingsId);

			expect(selectMock).toHaveBeenCalledTimes(1);
			expect(selectMock).toHaveBeenCalledWith('accountSettings');
			expect(fromMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledWith(AccountSettings, 'accountSettings');
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('accountSettings.id = :id', {
				id: existingAccountSettingsId,
			});
			expect(getOneMock).toHaveBeenCalledTimes(1);
		});

		it('should find account settings, if they exist', async (): Promise<void> => {
			resolvedValue =
				accountSettingsMock.find(
					(settings: AccountSettings) => settings.id === existingAccountSettingsId,
				) || null;

			const foundedSettings: AccountSettings | null =
				await accountSettingsRepository.getById(existingAccountSettingsId);

			expect(foundedSettings?.id).toEqual(existingAccountSettingsId);
		});

		it('should return founded settings as instance of AccountSettings', async (): Promise<void> => {
			resolvedValue =
				accountSettingsMock.find(
					(settings: AccountSettings) => settings.id === existingAccountSettingsId,
				) || null;

			const foundedSettings: AccountSettings | null =
				await accountSettingsRepository.getById(existingAccountSettingsId);

			expect(foundedSettings).toBeInstanceOf(AccountSettings);
		});

		it('should return null, if settings not exist', async (): Promise<void> => {
			const foundedSettings: AccountSettings | null = await accountSettingsRepository.getById(
				notExistingAccountSettingsId,
			);

			expect(foundedSettings).toBeNull();
		});
	});
});
