import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

import { Response } from 'express';

import { ErrorResponseResult } from '@responses/errorResponses';
import { ErrorField } from '@responses/errors';

import { ResponseStatus, Environments } from '@enums';

import { DateHelper } from '@helpers';

import { GlobalTypes } from '@customTypes';

/**
 * Global exception filter for handling all exceptions and errors in app.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly MESSAGE_FIELD_SEPARATOR: string = '|';

	public catch(exception: HttpException | Error, host: ArgumentsHost): void {
		const ctx: HttpArgumentsHost = host.switchToHttp();
		const response: Response = ctx.getResponse<Response>();

		const responseResult: ErrorResponseResult<ErrorField[]> = new ErrorResponseResult(
			ResponseStatus.ERROR,
		);

		const status: number =
			exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

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

		if (process.env.NODE_ENV === Environments.DEV) {
			responseResult.stack = exception.stack;
			responseResult.dateTime = DateHelper.dateTimeNow();
		}

		response.status(status).json(responseResult);
	}
}
