import { AccountSettings } from '@Entities/AccountSettings.entity';
import { DataSource, InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';

describe('accountSettingsRepository', (): void => {
	let accountSettingsRepository: AccountSettingsRepository;

	const insertMock: jest.Mock = jest.fn().mockReturnThis();
	const intoMock: jest.Mock = jest.fn().mockReturnThis();
	const valuesMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<InsertResult> => {
		return <InsertResult>{
			identifiers: <ObjectLiteral>[{ id: '001' }],
		};
	});

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				insert: insertMock,
				into: intoMock,
				values: valuesMock,
				execute: executeMock,
			};
		}),
	};

	beforeEach((): void => {
		accountSettingsRepository = new AccountSettingsRepository(dataSourceMock);
	});

	describe('createDefaultSettings', (): void => {
		const id: string = '001';

		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(accountSettingsRepository.createDefaultSettings).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(accountSettingsRepository.createDefaultSettings).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query for creating default account settings', async (): Promise<void> => {
			await accountSettingsRepository.createDefaultSettings();

			expect(insertMock).toHaveBeenCalledTimes(1);
			expect(intoMock).toHaveBeenCalledTimes(1);
			expect(intoMock).toHaveBeenCalledWith(AccountSettings);
			expect(valuesMock).toHaveBeenCalledTimes(1);
			expect(valuesMock).toHaveBeenCalledWith({});
			expect(executeMock).toHaveBeenCalledTimes(1);
		});

		it('should return id of created account settings', async (): Promise<void> => {
			const accountSettingsId: string = await accountSettingsRepository.createDefaultSettings();

			expect(accountSettingsId).toEqual(id);
		});
	});
});
