import { ResponseStatus } from '@enums';

import { ResponseResult } from '@responses';

export class SuccessfulResponseResult<T = object> extends ResponseResult {
	public data: T;

	constructor(status: ResponseStatus) {
		super(status);
	}
}
