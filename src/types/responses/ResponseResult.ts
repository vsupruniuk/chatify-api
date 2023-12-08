import { HttpStatus } from '@nestjs/common';

import { ApiProperty } from '@nestjs/swagger';

import { ResponseStatus } from '@Enums/ResponseStatus.enum';

/**
 * Base class for successful end error response results
 */
export abstract class ResponseResult {
	@ApiProperty({
		enum: ResponseStatus,
		enumName: 'ResponseStatus',
		description: 'Response status',
		required: true,
		example: ResponseStatus.SUCCESS,
	})
	public status: ResponseStatus;

	@ApiProperty({
		type: Number,
		description: 'Http response status code',
		required: true,
		example: HttpStatus.CREATED,
	})
	public code: HttpStatus;

	constructor(code: HttpStatus, status: ResponseStatus) {
		this.code = code;
		this.status = status;
	}
}
