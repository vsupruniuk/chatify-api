import { Environments } from '@Enums/Environments.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { WSEvents } from '@Enums/WSEvents.enum';
import { DateHelper } from '@Helpers/date.helper';
import { IValidationError } from '@Interfaces/errors/IValidationError';
import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { ErrorWSResponseResult } from '@Responses/errorResponses/ErrorWSResponseResult';
import { ValidationErrorField } from '@Responses/errors/ValidationErrorField';
import { Socket } from 'socket.io';

/**
 * Exception filter for handling websockets exceptions and errors in app.
 */
@Catch(HttpException, WsException)
export class wsExceptionFilter extends BaseWsExceptionFilter {
	public catch(exception: WsException | HttpException, host: ArgumentsHost): void {
		const client: Socket = host.switchToWs().getClient();

		const responseResult: ErrorWSResponseResult<ValidationErrorField> =
			new ErrorWSResponseResult<ValidationErrorField>(ResponseStatus.ERROR);

		responseResult.title = (exception as unknown as IValidationError).response?.error || '';

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

		client.emit(WSEvents.ON_ERROR, responseResult);
	}
}
