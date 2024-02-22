import { IFailedRequestProps } from '@Interfaces/logger/loggerMethodsProps/IFailedRequestProps';
import { IIncomingRequestProps } from '@Interfaces/logger/loggerMethodsProps/IIncomingRequestProps';
import { ISuccessfulDBQuery } from '@Interfaces/logger/loggerMethodsProps/ISuccessfulDBQuery';
import { ISuccessfulRequest } from '@Interfaces/logger/loggerMethodsProps/ISuccessfulRequest';

export interface IAppLogger {
	/**
	 * Logging to console information about incoming request
	 * @param requestMethod - name of method that handle request
	 * @param controller - name of controller that handle request
	 * @param body - data received in controller method from body
	 * @param queryParams - queryParams received in controller method
	 * @param cookies - cookies which were set to client
	 */
	incomingRequest<T extends object>({
		requestMethod,
		controller,
		body,
		queryParams,
		cookies,
	}: IIncomingRequestProps<T>): void;

	/**
	 * Logging to console information about failed request
	 * @param code - HTTP status code that will be sent to client
	 * @param title - error title
	 * @param errors - array of errors
	 */
	failedRequest({ code, title, errors }: IFailedRequestProps): void;

	/**
	 * Logging to console information about successful request
	 * @param code - HTTP status code that will be sent to client
	 * @param data - data that will be sent to client
	 */
	successfulRequest<T extends object>({ code, data }: ISuccessfulRequest<T>): void;

	/**
	 * Logging to console information about success query to database
	 * @param method - name of the method that handle query
	 * @param repository - name of the repository that handle query
	 * @param data - received data
	 */
	successfulDBQuery<T extends object>({ method, repository, data }: ISuccessfulDBQuery<T>): void;
}
