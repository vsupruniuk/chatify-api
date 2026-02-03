import { ResponseStatus } from '@enums';

export abstract class WSResponseResult {
	public status: ResponseStatus;

	protected constructor(status: ResponseStatus) {
		this.status = status;
	}
}
