import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

import { Socket } from 'socket.io';

import { WSEvent, ResponseStatus, Environment } from '@enums';

import { ErrorWSResponseResult } from '@responses/errorResponses';
import { ErrorField } from '@responses/errors';

import { GlobalTypes } from '@customTypes';

import { DateHelper } from '@helpers';

/**
 * Exception filter for handling websockets exceptions and errors in app.
 */
@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
	private readonly MESSAGE_FIELD_SEPARATOR: string = '|';

	public catch(exception: HttpException | Error, host: ArgumentsHost): void {
		const client: Socket = host.switchToWs().getClient();

		const responseResult: ErrorWSResponseResult<ErrorField[]> = new ErrorWSResponseResult<
			ErrorField[]
		>(ResponseStatus.ERROR);

		if (exception instanceof HttpException) {
			responseResult.message =
				exception.getStatus() < 500 && exception.getStatus() >= 400
					? 'Client error'
					: 'Internal server error';

			const errorMessages: string[] | string = (
				exception.getResponse() as GlobalTypes.IValidationErrorResponse
			).message;

			const messages: string[] = Array.isArray(errorMessages) ? errorMessages : [errorMessages];

			responseResult.errors = messages.map((msg: string) => {
				const [message, field = null] = msg.split(this.MESSAGE_FIELD_SEPARATOR);

				return { message, field };
			});
		} else {
			responseResult.message = 'Internal server error';

			responseResult.errors = [{ message: exception.message, field: null }];
		}

		if (process.env.NODE_ENV === Environment.DEV) {
			responseResult.stack = exception.stack;
			responseResult.dateTime = DateHelper.dateTimeNow();
		}

		client.emit(WSEvent.ON_ERROR, responseResult);
	}
}
