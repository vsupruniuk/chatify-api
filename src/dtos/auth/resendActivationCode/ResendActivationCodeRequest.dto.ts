import { IsEmail, MaxLength } from 'class-validator';

import { Trim } from '@decorators/sanitizing';

export class ResendActivationCodeRequestDto {
	@Trim()
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsEmail({}, { message: 'Wrong $property format|$property' })
	public email: string;
}
