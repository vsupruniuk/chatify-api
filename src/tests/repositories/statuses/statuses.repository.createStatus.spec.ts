import { InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

import { connectionSource } from '@DB/typeOrmConfig';

import { CreateStatusDto } from '@DTO/statuses/CreateStatus.dto';

import { StatusesRepository } from '@Repositories/statuses.repository';

import SpyInstance = jest.SpyInstance;

describe('statusesRepository', (): void => {
	let statusesRepository: StatusesRepository;

	beforeEach((): void => {
		statusesRepository = new StatusesRepository(connectionSource);
	});

	describe('createStatus', (): void => {
		let insertMock: SpyInstance;
		const id: string = '01';
		const status: CreateStatusDto = {
			dateTime: '2023-11-19 12:00:00',
			statusText: 'Default status',
		};

		beforeEach((): void => {
			insertMock = jest.spyOn(statusesRepository, 'insert').mockResolvedValue(
				Promise.resolve(<InsertResult>{
					identifiers: <ObjectLiteral>[{ id }],
				}),
			);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(statusesRepository.createStatus).toBeDefined();
		});

		it('should use insert method for creating status', async (): Promise<void> => {
			await statusesRepository.createStatus(status);

			expect(insertMock).toHaveBeenCalledWith(status);
		});

		it('should return id of created status', async (): Promise<void> => {
			const statusId: string = await statusesRepository.createStatus(status);

			expect(statusId).toEqual(id);
		});
	});
});
