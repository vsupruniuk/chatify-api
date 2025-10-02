import { Expose } from 'class-transformer';

export class AccountSettingsDto {
	@Expose()
	public id: string;

	@Expose()
	public enterIsSending: boolean;

	@Expose()
	public notification: boolean;

	@Expose()
	public twoStepVerification: boolean;
}
