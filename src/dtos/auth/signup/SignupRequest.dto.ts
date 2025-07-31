import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsStringsSimilar } from '@decorators/validation/IsStringsSimilar.decorator';

export class SignupRequestDto {
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsEmail({}, { message: 'Wrong $property format|$property' })
	public email: string;

	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@MinLength(3, {
		message: '$property must be at least $constraint1 characters long|$property',
	})
	@IsString({ message: '$property must be a string|$property' })
	public firstName: string;

	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@MinLength(3, { message: '$property must be at least $constraint1 characters long|$property' })
	@IsString({ message: '$property must be a string|$property' })
	@IsOptional()
	public lastName?: string;

	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@MinLength(3, { message: '$property must be at least $constraint1 characters long|$property' })
	@IsString({ message: '$property must be a string|$property' })
	public nickname: string;

	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character|$property',
	})
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@MinLength(6, { message: '$property must be at least $constraint1 characters long|$property' })
	@IsString({ message: '$property must be a string|$property' })
	public password: string;

	@IsStringsSimilar('password', {
		message: 'Password and password confirmation must match|$property',
	})
	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character|$property',
	})
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@MinLength(6, { message: '$property must be at least $constraint1 characters long|$property' })
	@IsString({ message: '$property must be a string|$property' })
	public passwordConfirmation: string;
}
