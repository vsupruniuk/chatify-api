import { ResponseStatus } from '@enums';

import { ResponseResult } from '@responses';

/**
 * Class representing successful response result
 */
export class SuccessfulResponseResult<T = object> extends ResponseResult {
	public data: T;

	constructor(status: ResponseStatus) {
		super(status);
	}
}
