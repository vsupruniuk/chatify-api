import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAppUserDto {
	@IsString({ message: '$property must be a string|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsOptional()
	public about?: string;

	@IsString({ message: '$property must be a string|$property' })
	@MinLength(3, {
		message: '$property must be at least $constraint1 characters long|$property',
	})
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsOptional()
	public firstName?: string;

	@IsString({ message: '$property must be a string|$property' })
	@MinLength(3, {
		message: '$property must be at least $constraint1 characters long|$property',
	})
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsOptional()
	public lastName?: string;

	@IsString({ message: '$property must be a string|$property' })
	@MinLength(3, { message: '$property must be at least $constraint1 characters long|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	@IsOptional()
	public nickname?: string;
}
