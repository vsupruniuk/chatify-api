import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAccountSettingsRequestDto {
	@IsBoolean({ message: '$property must be a boolean|$property' })
	@IsOptional()
	public enterIsSending?: boolean;

	@IsBoolean({ message: '$property must be a boolean|$property' })
	@IsOptional()
	public notification?: boolean;

	@IsBoolean({ message: '$property must be a boolean|$property' })
	@IsOptional()
	public twoStepVerification?: boolean;
}
