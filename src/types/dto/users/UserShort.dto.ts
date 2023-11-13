import { Expose } from 'class-transformer';

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
	accountSettingsId: string;

	@Expose()
	OTPCodeId: string | null;
}
