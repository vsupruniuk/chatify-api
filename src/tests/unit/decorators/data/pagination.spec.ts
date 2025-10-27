import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { MetadataHelper } from '@testHelpers';
import { Pagination } from '@decorators/data';

describe('Pagination decorator', (): void => {
	it('should return pagination queries as number values', async (): Promise<void> => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(Pagination);

		const executionContext: ExecutionContext = {
			switchToHttp: () => ({
				getRequest: () => ({
					query: { page: '2', take: '15' },
				}),
			}),
		} as ExecutionContext;

		const result = await factory('', executionContext);

		expect(result).toEqual({ page: 2, take: 15 });
	});

	it('should use default values for page and take parameters if some of the queries are not provided', async (): Promise<void> => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(Pagination);

		const executionContext: ExecutionContext = {
			switchToHttp: () => ({
				getRequest: () => ({
					query: {},
				}),
			}),
		} as ExecutionContext;

		const result = await factory('', executionContext);

		expect(result).toEqual({ page: 1, take: 10 });
	});

	it('should throw bad request exception if page query is less than 1', async (): Promise<void> => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(Pagination);

		const executionContext: ExecutionContext = {
			switchToHttp: () => ({
				getRequest: () => ({
					query: { page: '0', take: '15' },
				}),
			}),
		} as ExecutionContext;

		await expect(factory('', executionContext)).rejects.toThrow(BadRequestException);
	});

	it('should throw bad request exception if take query is less than 1', async (): Promise<void> => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(Pagination);

		const executionContext: ExecutionContext = {
			switchToHttp: () => ({
				getRequest: () => ({
					query: { page: '1', take: '0' },
				}),
			}),
		} as ExecutionContext;

		await expect(factory('', executionContext)).rejects.toThrow(BadRequestException);
	});
});
