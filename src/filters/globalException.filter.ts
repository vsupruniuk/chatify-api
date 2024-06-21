import { Environments } from '@Enums/Environments.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { DateHelper } from '@Helpers/date.helper';
import { IValidationError } from '@Interfaces/errors/IValidationError';
import { AppLogger } from '@Logger/app.logger';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { ErrorResponseResult } from '@Responses/errorResponses/ErrorResponseResult';
import { ValidationErrorField } from '@Responses/errors/ValidationErrorField';

import { Response } from 'express';

/**
 * Global exception filter for handling all exceptions and errors in app.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly _logger: AppLogger = new AppLogger();

	catch(exception: Error, host: ArgumentsHost) {
		const ctx: HttpArgumentsHost = host.switchToHttp();
		const response: Response = ctx.getResponse<Response>();

		const responseResult: ErrorResponseResult<ValidationErrorField> =
			new ErrorResponseResult<ValidationErrorField>(HttpStatus.BAD_REQUEST, ResponseStatus.ERROR);

		responseResult.title = (exception as unknown as IValidationError).response?.error || '';
		responseResult.code =
			exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		responseResult.message =
			responseResult.code < 500 && responseResult.code >= 400
				? 'Client error'
				: 'Internal server error';

		responseResult.errors = Array.isArray(
			(exception as unknown as IValidationError).response?.message || null,
		)
			? (exception as unknown as IValidationError).response?.message?.map((error: string) => {
					const [message, field = null] = error.split('|');

					return { message, field };
				}) || []
			: ([
					{
						message: (exception as unknown as IValidationError).response?.message || '',
						field: null,
					},
				] as unknown as ValidationErrorField[]);

		responseResult.errorsLength = responseResult.errors.length;

		if (process.env.NODE_ENV === Environments.DEV) {
			responseResult.stack = exception.stack;
			responseResult.dateTime = DateHelper.dateTimeNow();
		}

		this._logger.failedRequest({
			code: responseResult.code,
			title: responseResult.title,
			errors: responseResult.errors,
		});

		response.status(responseResult.code).json(responseResult);
	}
}
