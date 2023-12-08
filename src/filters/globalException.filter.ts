import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { Response } from 'express';

import { Environments } from '@Enums/Environments.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { IValidationError } from '@Interfaces/errors/IValidationError';

import { ErrorResponseResult } from '@Responses/errorResponses/ErrorResponseResult';
import { ValidationErrorField } from '@Responses/errors/ValidationErrorField';

import { DateHelper } from '@Helpers/date.helper';

/**
 * Global exception filter for handling all exceptions and errors in app.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: Error, host: ArgumentsHost) {
		const ctx: HttpArgumentsHost = host.switchToHttp();
		const response: Response = ctx.getResponse<Response>();
		const responseResult: ErrorResponseResult<ValidationErrorField> = new ErrorResponseResult(
			HttpStatus.BAD_REQUEST,
			ResponseStatus.ERROR,
		);

		responseResult.title = (exception as unknown as IValidationError).response.error;
		responseResult.code =
			exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		responseResult.message =
			responseResult.code < 500 && responseResult.code >= 400
				? 'Some fields did not pass validation'
				: 'Internal server error';

		responseResult.errors = (exception as unknown as IValidationError).response.message.map(
			(error: string) => {
				const [message, field] = error.split('|');

				return { message, field };
			},
		);

		responseResult.errorsLength = responseResult.errors.length;

		if (process.env.NODE_ENV === Environments.DEV) {
			responseResult.stack = exception.stack;
			responseResult.dateTime = DateHelper.dateTimeNow();
		}

		response.status(responseResult.code).json(responseResult);
	}
}
