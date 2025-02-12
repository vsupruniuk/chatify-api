import { WSResponseResult } from '@responses/WSResponseResult';
import { ResponseStatus } from '@enums/ResponseStatus.enum';

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
