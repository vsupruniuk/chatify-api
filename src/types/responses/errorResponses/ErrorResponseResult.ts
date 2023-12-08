import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseResult } from 'src/types/responses/ResponseResult';

export class ErrorResponseResult<T> extends ResponseResult {
	@ApiProperty({
		type: String,
		description: 'Title of error',
		required: true,
		example: 'Bad Request',
	})
	public title: string;

	@ApiProperty({
		type: String,
		description: 'Message of error',
		required: true,
		example: 'Some fields did not pass validation',
	})
	public message: string;

	@ApiProperty({
		type: [Object],
		description: 'Array of validation errors',
		required: true,
	})
	public errors: T[];

	@ApiProperty({
		type: Number,
		description: 'Length of validation errors',
		required: true,
		example: 1,
	})
	public errorsLength: number;

	@ApiProperty({
		type: String,
		description: 'Stack trace of error. Available only in development mode',
		nullable: true,
	})
	public stack?: string;

	@ApiProperty({
		type: String,
		description: 'Date and time of error. Available only in development mode',
		nullable: true,
		example: '2023-12-08 22:20:00',
	})
	public dateTime?: string;

	constructor(code: HttpStatus, status: ResponseStatus) {
		super(code, status);
	}
}
