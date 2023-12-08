import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseResult } from 'src/types/responses/ResponseResult';

export class SuccessfulResponseResult<T> extends ResponseResult {
	@ApiProperty({
		type: [Object],
		description: 'Response data for successful request',
		required: true,
	})
	public data: T[];

	@ApiProperty({
		type: Number,
		description: 'Length of response data',
		required: true,
		example: 1,
	})
	public dataLength: number;

	constructor(code: HttpStatus, status: ResponseStatus) {
		super(code, status);
	}
}
