import { IsEmail, MaxLength } from 'class-validator';

export class ResetPasswordDto {
	@IsEmail({}, { message: 'Wrong $property format|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	email: string;
}
