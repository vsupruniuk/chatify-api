import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class AccountActivationDto {
	@IsUUID(4, { message: '$property must be a valid UUID id|$property' })
	public id: string;

	@IsNumber({}, { message: '$property must be a number|$property' })
	@Min(100000, { message: '$property must be a 6-digit number|$property' })
	@Max(999999, { message: '$property must be a 6-digit number|$property' })
	public code: number;

	@IsUUID(4, { message: '$property must be a valid UUID id|$property' })
	public OTPCodeId: string;
}
