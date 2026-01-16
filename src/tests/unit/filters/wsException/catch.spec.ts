import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

import { Socket } from 'socket.io';

import { Environment, WSEvent, ResponseStatus } from '@enums';

import { ErrorResponseResult } from '@responses/errorResponses';
import { ErrorField } from '@responses/errors';

import { WsExceptionFilter } from '@filters';

describe('WS exception filter', (): void => {
	let wsExceptionFilter: WsExceptionFilter;

	beforeAll((): void => {
		wsExceptionFilter = new WsExceptionFilter();

		process.env.NODE_ENV = Environment.PROD;
	});

	afterAll((): void => {
		delete process.env.NODE_ENV;
	});

	describe('Catch', (): void => {
		const client: Socket = {
			emit: jest.fn(),
		} as unknown as Socket;

		const errorMessage: string = 'Test error message';
		const errorField: string = 'testField';

		const exception: HttpException = new BadRequestException(`${errorMessage}|${errorField}`);
		const host: ArgumentsHost = {
			switchToWs: () => ({
				getClient: () => client,
			}),
		} as ArgumentsHost;

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should emit response for on error event', (): void => {
			wsExceptionFilter.catch(exception, host);

			const eventName: WSEvent = (client.emit as jest.Mock).mock.calls[0][0];

			expect(eventName).toBe(WSEvent.ON_ERROR);
		});

		it('should create a valid message and errors fields for http exception', (): void => {
			wsExceptionFilter.catch(exception, host);

			const response: ErrorResponseResult<ErrorField[]> = (client.emit as jest.Mock).mock
				.calls[0][1];

			expect(response.status).toBe(ResponseStatus.ERROR);
			expect(response.message).toBe('Client error');
			expect(response.errors).toEqual([{ message: errorMessage, field: errorField }]);
		});

		it('should create error message with null field if field name is not specified', (): void => {
			wsExceptionFilter.catch(new BadRequestException(errorMessage), host);

			const response: ErrorResponseResult<ErrorField[]> = (client.emit as jest.Mock).mock
				.calls[0][1];

			expect(response.errors).toEqual([{ message: errorMessage, field: null }]);
		});

		it('should create a valid message and errors fields for non http exception', (): void => {
			wsExceptionFilter.catch(new Error(errorMessage), host);

			const response: ErrorResponseResult<ErrorField[]> = (client.emit as jest.Mock).mock
				.calls[0][1];

			expect(response.status).toBe(ResponseStatus.ERROR);
			expect(response.message).toBe('Internal server error');
			expect(response.errors).toEqual([{ message: errorMessage, field: null }]);
		});

		it('should create a valid errors fields if exception contains and array of errors', (): void => {
			wsExceptionFilter.catch(
				new BadRequestException([`${errorMessage}|${errorField}`, `${errorMessage}|${errorField}`]),
				host,
			);

			const response: ErrorResponseResult<ErrorField[]> = (client.emit as jest.Mock).mock
				.calls[0][1];

			expect(response.errors).toEqual([
				{ message: errorMessage, field: errorField },
				{ message: errorMessage, field: errorField },
			]);
		});

		it('should specify stack trace and date time in dev environment', (): void => {
			process.env.NODE_ENV = Environment.DEV;

			wsExceptionFilter.catch(exception, host);

			const response: ErrorResponseResult<ErrorField[]> = (client.emit as jest.Mock).mock
				.calls[0][1];

			expect(response.stack).toBeDefined();
			expect(response.dateTime).toBeDefined();
		});
	});
});
