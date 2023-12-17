import { HttpStatus } from '@nestjs/common';

import { ResponseStatus } from '@Enums/ResponseStatus.enum';

import { ResponseResult } from '@Responses/ResponseResult';

/**
 * Class representing error response result
 */
export class ErrorResponseResult<T> extends ResponseResult {
	public title: string;

	public message: string;

	public errors: T[];

	public errorsLength: number;

	public stack?: string;

	public dateTime?: string;

	constructor(code: HttpStatus, status: ResponseStatus) {
		super(code, status);
	}
}
