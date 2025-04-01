import { Expose, Type } from 'class-transformer';
import { OTPCodeDto } from '@dtos/otpCode/OTPCodeDto';

export class UserWithOtpCodeDto {
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
	@Type(() => OTPCodeDto)
	public otpCode: OTPCodeDto;
}
