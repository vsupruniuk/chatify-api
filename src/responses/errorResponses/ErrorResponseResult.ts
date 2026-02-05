import { ResponseStatus } from '@enums';

import { ResponseResult } from '@responses';

export class ErrorResponseResult<T = object> extends ResponseResult {
	public message: string;

	public errors: T;

	public stack?: string;

	public dateTime?: string;

	constructor(status: ResponseStatus) {
		super(status);
	}
}
