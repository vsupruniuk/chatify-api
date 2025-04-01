import { Expose } from 'class-transformer';

export class LoginDto {
	@Expose()
	public accessToken: string;

	@Expose()
	public refreshToken: string;
}
