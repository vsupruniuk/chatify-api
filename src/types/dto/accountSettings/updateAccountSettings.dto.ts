import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAccountSettingsDto {
	@IsBoolean({ message: '$property must be a boolean|$property' })
	@IsOptional()
	public enterIsSend?: boolean;

	@IsBoolean({ message: '$property must be a boolean|$property' })
	@IsOptional()
	public notification?: boolean;

	@IsBoolean({ message: '$property must be a boolean|$property' })
	@IsOptional()
	public twoStepVerification?: boolean;
}
