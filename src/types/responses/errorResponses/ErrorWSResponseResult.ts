import { ResponseStatus } from '@Enums/ResponseStatus.enum';

import { WSResponseResult } from '@Responses/WSResponseResult';

/**
 * Class representing error web sockets response result
 */
export class ErrorWSResponseResult<T> extends WSResponseResult {
	public title: string;

	public errors: T[];

	public errorsLength: number;

	public stack?: string;

	public dateTime?: string;

	constructor(status: ResponseStatus) {
		super(status);
	}
}
