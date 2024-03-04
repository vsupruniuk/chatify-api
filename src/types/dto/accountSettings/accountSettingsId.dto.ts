import { Expose } from 'class-transformer';

export class AccountSettingsIdDto {
	@Expose()
	id: string;
}
