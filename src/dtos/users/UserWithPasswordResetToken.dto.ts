import { Expose, Type } from 'class-transformer';

import { PasswordResetTokenDto } from '@dtos/passwordResetToken';

export class UserWithPasswordResetTokenDto {
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
	@Type(() => PasswordResetTokenDto)
	public passwordResetToken: PasswordResetTokenDto;
}
