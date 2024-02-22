import { AppLoggerMessageTypes } from '@Enums/AppLoggerMessageTypes.enum';
import { Environments } from '@Enums/Environments.enum';
import { SensitiveDtoData } from '@Enums/SensitiveDtoData.enum';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { IFailedRequestProps } from '@Interfaces/logger/loggerMethodsProps/IFailedRequestProps';
import { IIncomingRequestProps } from '@Interfaces/logger/loggerMethodsProps/IIncomingRequestProps';
import { ISuccessfulDBQuery } from '@Interfaces/logger/loggerMethodsProps/ISuccessfulDBQuery';
import { ISuccessfulRequest } from '@Interfaces/logger/loggerMethodsProps/ISuccessfulRequest';
import { ConsoleLogger } from '@nestjs/common';
import { yellow, green, whiteBright, red, blue, magenta } from 'ansi-colors';

export class AppLogger extends ConsoleLogger implements IAppLogger {
	public incomingRequest<T extends object>({
		requestMethod,
		controller,
		body,
		queryParams,
		cookies,
	}: IIncomingRequestProps<T>): void {
		const logMessageType: string = AppLoggerMessageTypes.INCOMING_REQUEST;
		const dateTime: string = new Date().toLocaleString();

		const logMessageParts: (string | null)[] = [
			'\n',
			yellow(`[${logMessageType}] `),
			green(`${requestMethod}  -`),
			whiteBright(` ${dateTime}`),
			'       ',
			yellow(`[${controller}]\n`),
			queryParams
				? green(
						`\n${yellow('Query Parameters:')} ${JSON.stringify(
							this.formatData(queryParams),
							null,
							2,
						)}\n`,
				  )
				: null,
			cookies
				? green(`\n${yellow('Cookies:')} ${JSON.stringify(this.formatData(cookies), null, 2)}\n`)
				: null,
			body ? green(`\n${yellow('Body:')} ${JSON.stringify(this.formatData(body), null, 2)}`) : null,
		];

		const logMessage: string = logMessageParts.join('');

		console.log(logMessage);
	}

	public failedRequest({ code, title, errors }: IFailedRequestProps): void {
		const logMessageType: string = AppLoggerMessageTypes.FAILED_REQUEST;
		const dateTime: string = new Date().toLocaleString();

		const logMessageParts: (string | null)[] = [
			'\n',
			red(`[${logMessageType}]  -`),
			whiteBright(` ${dateTime}`),
			'       ',
			yellow('\nCode: '),
			green(`${code}`),
			yellow('\nTitle: '),
			green(`${title}`),
			yellow('\nErrors: '),
			green(`${JSON.stringify(errors, null, 2)}`),
		];

		const logMessage: string = logMessageParts.join('');

		console.log(logMessage);
	}

	public successfulRequest<T extends object>({ code, data }: ISuccessfulRequest<T>): void {
		const logMessageType: string = AppLoggerMessageTypes.SUCCESSFUL_REQUEST;
		const dateTime: string = new Date().toLocaleString();

		const logMessageParts: (string | null)[] = [
			'\n',
			blue(`[${logMessageType}]  -`),
			whiteBright(` ${dateTime}`),
			'       ',
			yellow('\nCode: '),
			green(`${code}`),
			yellow('\nData: '),
			data
				? green(
						`${JSON.stringify(
							this.formatData(
								data.map((dataEntry: T | null) => dataEntry && this.formatData(dataEntry)),
							),
							null,
							2,
						)}`,
				  )
				: null,
		];

		const logMessage: string = logMessageParts.join('');

		console.log(logMessage);
	}

	public successfulDBQuery<T extends object>({
		method,
		repository,
		data,
	}: ISuccessfulDBQuery<T>): void {
		const logMessageType: string = AppLoggerMessageTypes.SUCCESSFUL_DB_QUERY;
		const dateTime: string = new Date().toLocaleString();

		const logMessageParts: (string | null)[] = [
			'\n',
			magenta(`[${logMessageType}] `),
			green(`${method}  -`),
			whiteBright(` ${dateTime}`),
			'       ',
			yellow(`[${repository}]\n`),
			data ? green(`\n${yellow('Body:')} ${JSON.stringify(this.formatData(data), null, 2)}`) : null,
		];

		const logMessage: string = logMessageParts.join('');

		console.log(logMessage);
	}

	private formatData<T extends object>(data: T): T {
		const newData: T = { ...data };

		if (process.env.NODE_ENV !== Environments.DEV) {
			Object.keys(newData).forEach((key: string) => {
				if (Object.values(SensitiveDtoData).includes(key as SensitiveDtoData)) {
					delete newData[key];
				}
			});
		}

		return newData;
	}
}
