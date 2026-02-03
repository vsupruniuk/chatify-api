import { ResponseStatus } from '@enums';

import { WSResponseResult } from '@responses';

export class ErrorWSResponseResult<T = object> extends WSResponseResult {
	public message: string;

	public errors: T;

	public stack?: string;

	public dateTime?: string;

	constructor(status: ResponseStatus) {
		super(status);
	}
}
