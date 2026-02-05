import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { AccountSettingsRepository } from '@repositories';

import { AccountSettings, User } from '@entities';

import { QueryBuilderMock, accountSettings, users } from '@testMocks';

import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/accountSettings';

describe('Account settings repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let accountSettingsRepository: AccountSettingsRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, AccountSettingsRepository],
		}).compile();

		accountSettingsRepository = moduleFixture.get(AccountSettingsRepository);
	});

	describe('Update account settings', (): void => {
		const expectedAccountSettings: AccountSettings = accountSettings[0];

		const userId: string = users[2].id;
		const updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto = {
			notification: expectedAccountSettings.notification,
			enterIsSending: expectedAccountSettings.enterIsSending,
			twoStepVerification: expectedAccountSettings.twoStepVerification,
		};

		const getQueryResultMock: string = 'settingsByUserIdSubQuery';

		beforeEach((): void => {
			queryBuilderMock.execute.mockReturnValue({ raw: [{ id: expectedAccountSettings.id }] });
			queryBuilderMock.getOne.mockReturnValue(expectedAccountSettings);
			queryBuilderMock.getQuery.mockReturnValue(getQueryResultMock);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder to create a sub-query to get settings by user id', async (): Promise<void> => {
			await accountSettingsRepository.updateAccountSettings(
				userId,
				updateAccountSettingsRequestDto,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.subQuery).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'accountSettings.id');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, AccountSettings, 'accountSettings');

			expect(queryBuilderMock.innerJoin).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.innerJoin).toHaveBeenNthCalledWith(
				1,
				User,
				'user',
				'user.account_settings_id = accountSettings.id',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'user.id = :userId', { userId });

			expect(queryBuilderMock.getQuery).toHaveBeenCalledTimes(1);
		});

		it('should use query builder to update user account setting', async (): Promise<void> => {
			await accountSettingsRepository.updateAccountSettings(
				userId,
				updateAccountSettingsRequestDto,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.update).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.update).toHaveBeenNthCalledWith(1, AccountSettings);

			expect(queryBuilderMock.set).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.set).toHaveBeenNthCalledWith(1, updateAccountSettingsRequestDto);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(2, `id IN (${getQueryResultMock})`);

			expect(queryBuilderMock.setParameters).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.setParameters).toHaveBeenNthCalledWith(1, { userId });

			expect(queryBuilderMock.returning).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.returning).toHaveBeenNthCalledWith(1, '*');

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(1);
		});

		it('should use query builder to retrieve an updated account settings', async (): Promise<void> => {
			await accountSettingsRepository.updateAccountSettings(
				userId,
				updateAccountSettingsRequestDto,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(2, 'accountSettings');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(2, AccountSettings, 'accountSettings');

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				3,
				'accountSettings.id = :accountSettingsId',
				{
					accountSettingsId: expectedAccountSettings.id,
				},
			);

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should use a transaction to rollback changes in case of errors', async (): Promise<void> => {
			await accountSettingsRepository.updateAccountSettings(
				userId,
				updateAccountSettingsRequestDto,
			);

			expect(queryBuilderMock.transaction).toHaveBeenCalledTimes(1);
		});

		it('should return updated account settings if they were successfully updated', async (): Promise<void> => {
			const result: AccountSettings | null = await accountSettingsRepository.updateAccountSettings(
				userId,
				updateAccountSettingsRequestDto,
			);

			expect(result).toEqual(expectedAccountSettings);
		});

		it('should return null if query builder failed to find updated settings', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const result: AccountSettings | null = await accountSettingsRepository.updateAccountSettings(
				userId,
				updateAccountSettingsRequestDto,
			);

			expect(result).toBeNull();
		});
	});
});
