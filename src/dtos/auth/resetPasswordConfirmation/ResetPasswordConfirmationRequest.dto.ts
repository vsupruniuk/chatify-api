import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { IsStringsSimilar } from '@decorators/validation';
import { Trim } from '@decorators/sanitizing';

export class ResetPasswordConfirmationRequestDto {
	@Trim()
	@Matches(/^(?=.*[0-9])(?=.*[A-Z])/, {
		message: '$property must contains at least 1 number and 1 uppercase character|$property',
	})
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@MinLength(6, { message: '$property must be at least $constraint1 characters long|$property' })
	@IsString({ message: '$property must be a string|$property' })
	public password: string;

	@Trim()
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
