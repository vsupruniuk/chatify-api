import { ResponseStatus } from '@enums/ResponseStatus.enum';

/**
 * Base class for successful end error response results
 */
export abstract class ResponseResult {
	public status: ResponseStatus;

	protected constructor(status: ResponseStatus) {
		this.status = status;
	}
}
