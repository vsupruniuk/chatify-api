import { AccountSettingsIdDto } from '@DTO/accountSettings/accountSettingsId.dto';
import { OTPCodeIdDto } from '@DTO/OTPCodes/OTPCodeId.dto';
import { Expose, Type } from 'class-transformer';

/**
 * DTO class representing response with user data
 */
export class UserShortDto {
	@Expose()
	id: string;

	@Expose()
	about: string | null;

	@Expose()
	avatarUrl: string | null;

	@Expose()
	email: string;

	@Expose()
	firstName: string;

	@Expose()
	lastName: string | null;

	@Expose()
	nickname: string;

	@Expose()
	@Type(() => AccountSettingsIdDto)
	accountSettings: AccountSettingsIdDto;

	@Expose()
	@Type(() => OTPCodeIdDto)
	OTPCode: OTPCodeIdDto;
}
