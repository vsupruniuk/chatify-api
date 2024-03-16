import { UpdateAccountSettingsDto } from '@DTO/accountSettings/updateAccountSettings.dto';
import { AccountSettings } from '@Entities/AccountSettings.entity';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { DataSource, UpdateResult } from 'typeorm';

describe('accountSettingsRepository', (): void => {
	let accountSettingsRepository: AccountSettingsRepository;

	let resolvedAffectedValue: number = 0;

	const updateMock: jest.Mock = jest.fn().mockReturnThis();
	const setMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<UpdateResult> => {
		return <UpdateResult>{
			raw: [],
			affected: resolvedAffectedValue,
			generatedMaps: [],
		};
	});

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				update: updateMock,
				set: setMock,
				where: whereMock,
				execute: executeMock,
			};
		}),
	};

	beforeEach((): void => {
		accountSettingsRepository = new AccountSettingsRepository(dataSourceMock);
	});

	describe('updateAccountSettings', (): void => {
		const existingSettingsId: string = '1';
		const notExistingSettingsId: string = '1';
		const updateAccountSettingsDto: Partial<UpdateAccountSettingsDto> = {
			enterIsSend: true,
			notification: true,
			twoStepVerification: false,
		};

		beforeEach((): void => {
			resolvedAffectedValue = 0;
			jest.clearAllMocks();
		});

		it('should be declared', async (): Promise<void> => {
			expect(accountSettingsRepository.updateAccountSettings).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(accountSettingsRepository.updateAccountSettings).toBeInstanceOf(Function);
		});

		it('should user queryBuilder to build query and update account settings', async (): Promise<void> => {
			await accountSettingsRepository.updateAccountSettings(
				existingSettingsId,
				updateAccountSettingsDto,
			);

			expect(updateMock).toHaveBeenCalledTimes(1);
			expect(updateMock).toHaveBeenCalledWith(AccountSettings);
			expect(setMock).toHaveBeenCalledTimes(1);
			expect(setMock).toHaveBeenCalledWith(updateAccountSettingsDto);
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('id = :id', {
				id: existingSettingsId,
			});
			expect(executeMock).toHaveBeenCalledTimes(1);
		});

		it('should return false if account settings with given id not exist', async (): Promise<void> => {
			const result: boolean = await accountSettingsRepository.updateAccountSettings(
				notExistingSettingsId,
				updateAccountSettingsDto,
			);

			expect(result).toBe(false);
		});

		it('should return true if account settings with given id exist and were updated', async (): Promise<void> => {
			resolvedAffectedValue = 1;

			const result: boolean = await accountSettingsRepository.updateAccountSettings(
				existingSettingsId,
				updateAccountSettingsDto,
			);

			expect(result).toBe(true);
		});
	});
});
