import { ResponseStatus } from '@enums';

export abstract class ResponseResult {
	public status: ResponseStatus;

	protected constructor(status: ResponseStatus) {
		this.status = status;
	}
}
