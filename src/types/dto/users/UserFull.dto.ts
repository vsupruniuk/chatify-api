import { Expose } from 'class-transformer';

export class UserFullDto {
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
	isActivated: boolean;

	@Expose()
	lastName: string | null;

	@Expose()
	nickname: string;

	@Expose()
	password: string;

	@Expose()
	passwordResetToken: string | null;

	@Expose()
	accountSettingsId: string;

	@Expose()
	OTPCodeId: string | null;
}
