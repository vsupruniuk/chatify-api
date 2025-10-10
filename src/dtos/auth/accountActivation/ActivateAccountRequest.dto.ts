import { IsEmail, IsNumber, Max, MaxLength, Min } from 'class-validator';

import { Trim } from '@decorators/sanitizing';

export class ActivateAccountRequestDto {
	@Trim()
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsEmail({}, { message: 'Wrong $property format|$property' })
	public email: string;

	@Min(100000, { message: '$property must be a 6-digit number|$property' })
	@Max(999999, { message: '$property must be a 6-digit number|$property' })
	@IsNumber({}, { message: '$property must be a number|$property' })
	public code: number;
}
