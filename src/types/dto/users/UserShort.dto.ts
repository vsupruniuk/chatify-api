import { AccountSettingsIdDto } from '@DTO/accountSettings/accountSettingsId.dto';
import { OTPCodeIdDto } from '@DTO/OTPCodes/OTPCodeId.dto';
import { Expose, Type } from 'class-transformer';

/**
 * DTO class representing response with user data
 */
export class UserShortDto {
	@Expose()
	public id: string;

	@Expose()
	public about: string | null;

	@Expose()
	public avatarUrl: string | null;

	@Expose()
	public email: string;

	@Expose()
	public firstName: string;

	@Expose()
	public lastName: string | null;

	@Expose()
	public nickname: string;

	@Expose()
	@Type(() => AccountSettingsIdDto)
	public accountSettings: AccountSettingsIdDto;

	@Expose()
	@Type(() => OTPCodeIdDto)
	public OTPCode: OTPCodeIdDto;
}
