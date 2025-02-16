import { IsEmail, IsNumber, Max, MaxLength, Min } from 'class-validator';

export class ActivateAccountRequestDto {
	@IsEmail({}, { message: 'Wrong $property format|$property' })
	@MaxLength(255, { message: '$property can be $constraint1 characters long maximum|$property' })
	public email: string;

	@IsNumber({}, { message: '$property must be a number|$property' })
	@Min(100000, { message: '$property must be a 6-digit number|$property' })
	@Max(999999, { message: '$property must be a 6-digit number|$property' })
	public code: number;
}
