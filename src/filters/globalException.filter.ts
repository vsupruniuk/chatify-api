import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { Response } from 'express';
import { ErrorResponseResult } from '@responses/errorResponses/ErrorResponseResult';
import { ErrorField } from '@responses/errors/ErrorField';
import { ResponseStatus } from '@enums/ResponseStatus.enum';
import { IValidationErrorResponse } from '@interfaces/errors/IValidationError';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

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

		console.log(exception);
		console.log(exception instanceof HttpException);

		if (exception instanceof HttpException) {
			responseResult.message =
				exception.getStatus() < 500 && exception.getStatus() >= 400
					? 'Client error'
					: 'Internal server error';

			const errorMessages: string[] | string = (exception.getResponse() as IValidationErrorResponse)
				.message;

			const messages: string[] = Array.isArray(errorMessages) ? errorMessages : [errorMessages];

			responseResult.errors = messages.map((msg: string) => {
				const [message, field] = msg.split(this.MESSAGE_FIELD_SEPARATOR);

				return { message, field };
			});

			response.status(exception.getStatus()).json(responseResult);
		} else {
			responseResult.message = 'Internal server error';

			responseResult.errors = [{ message: exception.message, field: null }];

			response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(responseResult);
		}
	}
}
