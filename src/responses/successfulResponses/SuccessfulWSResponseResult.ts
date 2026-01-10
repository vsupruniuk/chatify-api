import { ResponseStatus } from '@enums';

import { WSResponseResult } from '@responses';

/**
 * Class representing successful web sockets response result
 */
export class SuccessfulWSResponseResult<T = object> extends WSResponseResult {
	public data: T;

	constructor(status: ResponseStatus) {
		super(status);
	}
}
