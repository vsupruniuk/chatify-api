import { ResponseStatus } from '@enums/ResponseStatus.enum';

import { ResponseResult } from '../ResponseResult';

/**
 * Class representing successful response result
 */
export class SuccessfulResponseResult<T> extends ResponseResult {
	public data: T;

	constructor(status: ResponseStatus) {
		super(status);
	}
}
