import { connectionSource } from '@DB/typeOrmConfig';
import SpyInstance = jest.SpyInstance;
import { InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';

describe('accountSettingsRepository', (): void => {
	let accountSettingsRepository: AccountSettingsRepository;

	beforeEach((): void => {
		accountSettingsRepository = new AccountSettingsRepository(connectionSource);
	});

	describe('createDefaultSettings', (): void => {
		let insertMock: SpyInstance;
		const id: string = '001';

		beforeEach((): void => {
			insertMock = jest.spyOn(accountSettingsRepository, 'insert').mockResolvedValue(
				Promise.resolve(<InsertResult>{
					identifiers: <ObjectLiteral>[{ id }],
				}),
			);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(accountSettingsRepository.createDefaultSettings).toBeDefined();
		});

		it('should use insert method for creating account settings', async (): Promise<void> => {
			await accountSettingsRepository.createDefaultSettings();

			expect(insertMock).toHaveBeenCalledWith({});
		});

		it('should return id of created account settings', async (): Promise<void> => {
			const accountSettingsId: string = await accountSettingsRepository.createDefaultSettings();

			expect(accountSettingsId).toEqual(id);
		});
	});
});
