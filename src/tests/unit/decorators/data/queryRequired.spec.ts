import { BadRequestException, ExecutionContext, PipeTransform } from '@nestjs/common';

import { MetadataHelper } from '@testHelpers';

import { QueryRequired } from '@decorators/data';

describe('Query required decorator', (): void => {
	const query: Record<string, string> = {
		username: 't.stark',
		chatId: '',
	};

	const firstPipe: PipeTransform = { transform: jest.fn((value: string) => value) };
	const secondPipe: PipeTransform = { transform: jest.fn((value: string) => value) };

	const executionContext: ExecutionContext = {
		switchToHttp: () => ({
			getRequest: () => ({
				query,
			}),
		}),
	} as ExecutionContext;

	it('should throw bad request exception if query is not provided', (): void => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(QueryRequired);

		expect(() => factory('page', executionContext)).toThrow(BadRequestException);
	});

	it('should throw bad request exception if query provided but with falsy value', (): void => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(QueryRequired);

		expect(() => factory('chatId', executionContext)).toThrow(BadRequestException);
	});

	it('should apply all provided pipes to a value', (): void => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(QueryRequired);

		factory('username', executionContext, firstPipe, secondPipe);

		expect(firstPipe.transform).toHaveBeenCalledTimes(1);
		expect(firstPipe.transform).toHaveBeenNthCalledWith(1, query.username, { type: 'query' });

		expect(secondPipe.transform).toHaveBeenCalledTimes(1);
		expect(secondPipe.transform).toHaveBeenNthCalledWith(1, query.username, { type: 'query' });
	});

	it('should return query parameter value', (): void => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(QueryRequired);

		const queryValue: string = factory('username', executionContext, firstPipe, secondPipe);

		expect(queryValue).toBe(query.username);
	});
});
