import { AccountSettingsFullDto } from '@DTO/accountSettings/accountSettingsFull.dto';
import { Expose, Type } from 'class-transformer';

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
	@Type(() => AccountSettingsFullDto)
	public accountSettings: AccountSettingsFullDto;
}
