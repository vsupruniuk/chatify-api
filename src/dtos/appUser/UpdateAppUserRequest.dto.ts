import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { Trim } from '@decorators/sanitizing';

export class UpdateAppUserRequestDto {
	@Trim()
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsString({ message: '$property must be a string|$property' })
	@IsOptional()
	public about?: string;

	@Trim()
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@MinLength(3, {
		message: '$property must be at least $constraint1 characters long|$property',
	})
	@IsString({ message: '$property must be a string|$property' })
	@IsOptional()
	public firstName?: string;

	@Trim()
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@MinLength(3, {
		message: '$property must be at least $constraint1 characters long|$property',
	})
	@IsString({ message: '$property must be a string|$property' })
	@IsOptional()
	public lastName?: string;

	@Trim()
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@MinLength(3, { message: '$property must be at least $constraint1 characters long|$property' })
	@IsString({ message: '$property must be a string|$property' })
	@IsOptional()
	public nickname?: string;
}
