import { ResponseStatus } from '@enums';

import { WSResponseResult } from '@responses';

export class SuccessfulWSResponseResult<T = object> extends WSResponseResult {
	public data: T;

	constructor(status: ResponseStatus) {
		super(status);
	}
}
