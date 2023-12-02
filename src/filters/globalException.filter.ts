import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { Response } from 'express';

import { IValidationError } from '@Interfaces/errors/IValidationError';

/**
 * Global exception filter for handling all exceptions and errors in app.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: Error, host: ArgumentsHost) {
		const ctx: HttpArgumentsHost = host.switchToHttp();
		const response: Response = ctx.getResponse<Response>();

		const status: number =
			exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		const messages: string[] | string = (exception as unknown as IValidationError).response.message
			? (exception as unknown as IValidationError).response.message
			: exception instanceof HttpException
			? [exception.message]
			: 'Internal Server Error';

		response.status(status).json({
			statusCode: status,
			messages,
		});
	}
}
