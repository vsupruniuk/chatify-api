import { IsEmail, IsOptional, IsString, MinLength, Matches, MaxLength } from 'class-validator';

import { IsStringsSimilar } from '@Decorators/IsStringsSimilar.decorator';

/**
 * DTO class representing request data for signup request
 */
export class SignupUserDto {
	@IsEmail({}, { message: 'Wrong $property format|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	email: string;

	@IsString({ message: '$property must be a string|$property' })
	@MinLength(3, {
		message: '$property must be at least $constraint1 characters long|$property',
	})
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	firstName: string;

	@MinLength(3, { message: '$property must be at least $constraint1 characters long|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsOptional()
	lastName?: string;

	@IsString({ message: '$property must be a string|$property' })
	@MinLength(3, { message: '$property must be at least $constraint1 characters long|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	nickname: string;

	@IsString({ message: '$property must be a string|$property' })
	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character|$property',
	})
	@MinLength(6, { message: '$property must be at least $constraint1 characters long|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	password: string;

	@IsString({ message: '$property must be a string|$property' })
	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character|$property',
	})
	@MinLength(6, { message: '$property must be at least $constraint1 characters long|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsStringsSimilar('password', {
		message: 'Password and password confirmation must match|$property',
	})
	passwordConfirmation: string;
}
