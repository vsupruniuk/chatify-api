import { Expose } from 'class-transformer';

export class LoginResponseDto {
	@Expose()
	public accessToken: string;
}
