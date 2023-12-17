import { HttpStatus } from '@nestjs/common';

import { ResponseStatus } from '@Enums/ResponseStatus.enum';

/**
 * Base class for successful end error response results
 */
export abstract class ResponseResult {
	public status: ResponseStatus;

	public code: HttpStatus;

	protected constructor(code: HttpStatus, status: ResponseStatus) {
		this.code = code;
		this.status = status;
	}
}
