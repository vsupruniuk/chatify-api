import { IsEmail, MaxLength } from 'class-validator';

export class ResendActivationCodeRequestDto {
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsEmail({}, { message: 'Wrong $property format|$property' })
	public email: string;
}
