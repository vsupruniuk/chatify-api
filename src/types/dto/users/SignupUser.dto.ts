import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { IsStringsSimilar } from '../../../decorators/IsStringsSimilar.decorator';

/**
 * DTO class representing request data for signup request
 */
export class SignupUserDto {
	@IsEmail({}, { message: 'Wrong $property format' })
	email: string;

	@IsString({ message: '$property must be a string' })
	@MinLength(3, { message: '$property must be at least $constraint1 characters long' })
	firstName: string;

	@MinLength(3, { message: '$property must be at least $constraint1 characters long' })
	@IsOptional()
	lastName?: string;

	@IsString({ message: '$property must be a string' })
	@MinLength(3, { message: '$property must be at least $constraint1 characters long' })
	nickname: string;

	@IsString({ message: '$property must be a string' })
	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character',
	})
	@MinLength(6, { message: '$property must be at least $constraint1 characters long' })
	password: string;

	@IsString({ message: '$property must be a string' })
	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character',
	})
	@MinLength(6, { message: '$property must be at least $constraint1 characters long' })
	@IsStringsSimilar('password', { message: 'Password and password confirmation must match' })
	passwordConfirmation: string;
}
