import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { IsStringsSimilar } from '../../../decorators/IsStringsSimilar.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO class representing request data for signup request
 */
export class SignupUserDto {
	@ApiProperty({
		type: String,
		description: 'User email for creating account',
		required: true,
		uniqueItems: true,
		maxLength: 255,
		example: 't.stark@mail.com',
	})
	@IsEmail({}, { message: 'Wrong $property format' })
	email: string;

	@ApiProperty({
		type: String,
		description: 'User first name',
		required: true,
		minLength: 3,
		maxLength: 255,
		example: 'Tony',
	})
	@IsString({ message: '$property must be a string' })
	@MinLength(3, { message: '$property must be at least $constraint1 characters long' })
	firstName: string;

	@ApiPropertyOptional({
		type: String,
		description: 'User last name',
		required: false,
		minLength: 3,
		maxLength: 255,
		example: 'Stark',
	})
	@MinLength(3, { message: '$property must be at least $constraint1 characters long' })
	@IsOptional()
	lastName?: string;

	@ApiProperty({
		type: String,
		description: 'User public nickname',
		required: true,
		uniqueItems: true,
		minLength: 3,
		maxLength: 255,
		example: 't.stark',
	})
	@IsString({ message: '$property must be a string' })
	@MinLength(3, { message: '$property must be at least $constraint1 characters long' })
	nickname: string;

	@ApiProperty({
		type: String,
		description:
			'User password. Must be at least 6 characters long, contains 1 number and 1 uppercase character',
		required: true,
		minLength: 6,
		maxLength: 255,
		example: 'qwerty1A',
	})
	@IsString({ message: '$property must be a string' })
	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character',
	})
	@MinLength(6, { message: '$property must be at least $constraint1 characters long' })
	password: string;

	@ApiProperty({
		type: String,
		description: 'Confirmation password, must match to password',
		required: true,
		minLength: 6,
		maxLength: 255,
		example: 'qwerty1A',
	})
	@IsString({ message: '$property must be a string' })
	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character',
	})
	@MinLength(6, { message: '$property must be at least $constraint1 characters long' })
	@IsStringsSimilar('password', { message: 'Password and password confirmation must match' })
	passwordConfirmation: string;
}
