import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

import { Response } from 'express';

import { GlobalExceptionFilter } from '@filters';

import { Environments, ResponseStatus } from '@enums';

import { ErrorResponseResult } from '@responses/errorResponses';
import { ErrorField } from '@responses/errors';

describe('Global exception filter', (): void => {
	let globalExceptionFilter: GlobalExceptionFilter;

	beforeAll((): void => {
		globalExceptionFilter = new GlobalExceptionFilter();

		process.env.NODE_ENV = Environments.PROD;
	});

	afterAll((): void => {
		delete process.env.NODE_ENV;
	});

	describe('Catch', (): void => {
		const responseMock: Response = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;

		const errorMessage: string = 'Test error message';
		const errorField: string = 'testField';

		const exception: HttpException = new BadRequestException(`${errorMessage}|${errorField}`);
		const host: ArgumentsHost = {
			switchToHttp: () => ({
				getResponse: () => responseMock,
			}),
		} as ArgumentsHost;

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call status method from a response object with the exception status if exception is instance of http exception', (): void => {
			globalExceptionFilter.catch(exception, host);

			expect(responseMock.status).toHaveBeenCalledTimes(1);
			expect(responseMock.status).toHaveBeenNthCalledWith(1, HttpStatus.BAD_REQUEST);
		});

		it('should call status method from a response object with the internal server error status if exception is not instance of http exception', (): void => {
			globalExceptionFilter.catch(new Error(), host);

			expect(responseMock.status).toHaveBeenCalledTimes(1);
			expect(responseMock.status).toHaveBeenNthCalledWith(1, HttpStatus.INTERNAL_SERVER_ERROR);
		});

		it('should create a valid message and errors fields for http exception', (): void => {
			globalExceptionFilter.catch(exception, host);

			const response: ErrorResponseResult<ErrorField[]> = (responseMock.json as jest.Mock).mock
				.calls[0][0];

			expect(response.status).toBe(ResponseStatus.ERROR);
			expect(response.message).toBe('Client error');
			expect(response.errors).toEqual([{ message: errorMessage, field: errorField }]);
		});

		it('should create error message with null field if field name is not specified', (): void => {
			globalExceptionFilter.catch(new BadRequestException(errorMessage), host);

			const response: ErrorResponseResult<ErrorField[]> = (responseMock.json as jest.Mock).mock
				.calls[0][0];

			expect(response.errors).toEqual([{ message: errorMessage, field: null }]);
		});

		it('should create a valid message and errors fields for non http exception', (): void => {
			globalExceptionFilter.catch(new Error(errorMessage), host);

			const response: ErrorResponseResult<ErrorField[]> = (responseMock.json as jest.Mock).mock
				.calls[0][0];

			expect(response.status).toBe(ResponseStatus.ERROR);
			expect(response.message).toBe('Internal server error');
			expect(response.errors).toEqual([{ message: errorMessage, field: null }]);
		});

		it('should specify stack trace and date time in dev environment', (): void => {
			process.env.NODE_ENV = Environments.DEV;

			globalExceptionFilter.catch(exception, host);

			const response: ErrorResponseResult<ErrorField[]> = (responseMock.json as jest.Mock).mock
				.calls[0][0];

			expect(response.stack).toBeDefined();
			expect(response.dateTime).toBeDefined();
		});
	});
});
