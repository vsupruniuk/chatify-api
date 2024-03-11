import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAccountSettingsDto {
	@IsBoolean({ message: '$property must be a boolean|$property' })
	@IsOptional()
	enterIsSend?: boolean;

	@IsBoolean({ message: '$property must be a boolean|$property' })
	@IsOptional()
	notification?: boolean;

	@IsBoolean({ message: '$property must be a boolean|$property' })
	@IsOptional()
	twoStepVerification?: boolean;
}
