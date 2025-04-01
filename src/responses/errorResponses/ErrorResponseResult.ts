import { ResponseStatus } from '@enums/ResponseStatus.enum';

import { ResponseResult } from '../ResponseResult';

/**
 * Class representing error response result
 */
export class ErrorResponseResult<T> extends ResponseResult {
	public message: string;

	public errors: T;

	public stack?: string;

	public dateTime?: string;

	constructor(status: ResponseStatus) {
		super(status);
	}
}
