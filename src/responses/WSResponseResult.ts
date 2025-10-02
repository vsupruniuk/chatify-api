import { ResponseStatus } from '@enums';

/**
 * Abstract class representing general fields for web sockets responses
 */
export abstract class WSResponseResult {
	public status: ResponseStatus;

	protected constructor(status: ResponseStatus) {
		this.status = status;
	}
}
