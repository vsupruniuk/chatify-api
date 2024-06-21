import { ResponseStatus } from '@Enums/ResponseStatus.enum';

import { WSResponseResult } from '@Responses/WSResponseResult';

/**
 * Class representing successful web sockets response result
 */
export class SuccessfulWSResponseResult<T> extends WSResponseResult {
	public data: T | T[];

	public dataLength?: number;

	constructor(status: ResponseStatus) {
		super(status);
	}
}
