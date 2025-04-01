import { ResponseStatus } from '@enums/ResponseStatus.enum';

import { WSResponseResult } from '../WSResponseResult';

/**
 * Class representing error web sockets response result
 */
export class ErrorWSResponseResult<T> extends WSResponseResult {
	public message: string;

	public errors: T;

	public stack?: string;

	public dateTime?: string;

	constructor(status: ResponseStatus) {
		super(status);
	}
}
