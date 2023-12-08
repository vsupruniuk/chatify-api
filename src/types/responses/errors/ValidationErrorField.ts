import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorField {
	@ApiProperty({
		type: String,
		description: 'Field which did not pass validation',
		required: true,
		example: 'Email',
	})
	field: string;
	@ApiProperty({
		type: String,
		description: 'Field which did not pass validation',
		required: true,
		example: 'Wrong email format',
	})
	message: string;
}
