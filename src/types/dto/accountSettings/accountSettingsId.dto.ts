import { Expose } from 'class-transformer';

export class AccountSettingsIdDto {
	@Expose()
	public id: string;
}
