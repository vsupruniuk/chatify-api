import { Expose } from 'class-transformer';

export class AccountSettingsFullDto {
	@Expose()
	id: string;

	@Expose()
	enterIsSend: boolean;

	@Expose()
	notification: boolean;

	@Expose()
	twoStepVerification: boolean;
}
