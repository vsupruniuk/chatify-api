import { IsEmail, IsOptional, IsString, MinLength, Matches, MaxLength } from 'class-validator';

import { IsStringsSimilar } from '@Decorators/IsStringsSimilar.decorator';

/**
 * DTO class representing request data for signup request
 */
export class SignupUserDto {
	@IsEmail({}, { message: 'Wrong $property format|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	public email: string;

	@IsString({ message: '$property must be a string|$property' })
	@MinLength(3, {
		message: '$property must be at least $constraint1 characters long|$property',
	})
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	public firstName: string;

	@MinLength(3, { message: '$property must be at least $constraint1 characters long|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsOptional()
	public lastName?: string;

	@IsString({ message: '$property must be a string|$property' })
	@MinLength(3, { message: '$property must be at least $constraint1 characters long|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	public nickname: string;

	@IsString({ message: '$property must be a string|$property' })
	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character|$property',
	})
	@MinLength(6, { message: '$property must be at least $constraint1 characters long|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	public password: string;

	@IsString({ message: '$property must be a string|$property' })
	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character|$property',
	})
	@MinLength(6, { message: '$property must be at least $constraint1 characters long|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsStringsSimilar('password', {
		message: 'Password and password confirmation must match|$property',
	})
	public passwordConfirmation: string;
}
