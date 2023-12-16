import { HttpStatus } from '@nestjs/common';

import { ResponseStatus } from '@Enums/ResponseStatus.enum';

import { ResponseResult } from '@Responses/ResponseResult';

/**
 * Class representing successful response result
 */
export class SuccessfulResponseResult<T> extends ResponseResult {
	public data: T[];

	public dataLength: number;

	constructor(code: HttpStatus, status: ResponseStatus) {
		super(code, status);
	}
}
