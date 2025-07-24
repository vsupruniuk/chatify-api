import { Environments } from '@enums/Environments.enum';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { ErrorResponseResult } from '@responses/errorResponses/ErrorResponseResult';
import { ErrorField } from '@responses/errors/ErrorField';
import { ResponseStatus } from '@enums/ResponseStatus.enum';
import { WsExceptionFilter } from '@filters/wsExceptionFilter';
import { Socket } from 'socket.io';
import { WSEvents } from '@enums/WSEvents.enum';

describe('WS exception filter', (): void => {
	let wsExceptionFilter: WsExceptionFilter;

	beforeAll((): void => {
		wsExceptionFilter = new WsExceptionFilter();

		process.env.NODE_ENV = Environments.PROD;
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

		it('should be defined', () => {
			expect(wsExceptionFilter.catch).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(wsExceptionFilter.catch).toBeInstanceOf(Function);
		});

		it('should emit response for on error event', (): void => {
			wsExceptionFilter.catch(exception, host);

			const eventName: WSEvents = (client.emit as jest.Mock).mock.calls[0][0];

			expect(eventName).toBe(WSEvents.ON_ERROR);
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

		it('should specify stack trace and date time in dev environment', (): void => {
			process.env.NODE_ENV = Environments.DEV;

			wsExceptionFilter.catch(exception, host);

			const response: ErrorResponseResult<ErrorField[]> = (client.emit as jest.Mock).mock
				.calls[0][1];

			expect(response.stack).toBeDefined();
			expect(response.dateTime).toBeDefined();
		});
	});
});
