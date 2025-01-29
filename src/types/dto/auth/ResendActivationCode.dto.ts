import { IsEmail, MaxLength } from 'class-validator';

export class ResendActivationCodeDto {
	@IsEmail({}, { message: 'Wrong $property format|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	public email: string;
}
