import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginRequestDto {
	@IsEmail({}, { message: 'Wrong $property format|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	public email: string;

	@IsString({ message: '$property must be a string|$property' })
	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character|$property',
	})
	@MinLength(6, { message: '$property must be at least $constraint1 characters long|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	public password: string;
}
