import { AccountSettingsFullDto } from '@DTO/accountSettings/accountSettingsFull.dto';
import { Expose, Type } from 'class-transformer';

export class AppUserDto {
	@Expose()
	id: string;

	@Expose()
	about: string | null;

	@Expose()
	avatarUrl: string | null;

	@Expose()
	firstName: string;

	@Expose()
	lastName: string | null;

	@Expose()
	nickname: string;

	@Expose()
	@Type(() => AccountSettingsFullDto)
	accountSettings: AccountSettingsFullDto;
}
