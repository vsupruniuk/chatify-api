import { Expose, Type } from 'class-transformer';
import { AccountSettingsDto } from '@dtos/accountSettings/AccountSettings.dto';

export class AppUserDto {
	@Expose()
	public id: string;

	@Expose()
	public about: string | null;

	@Expose()
	public avatarUrl: string | null;

	@Expose()
	public firstName: string;

	@Expose()
	public lastName: string | null;

	@Expose()
	public nickname: string;

	@Expose()
	@Type(() => AccountSettingsDto)
	public accountSettings: AccountSettingsDto;
}
