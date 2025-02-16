import { Expose } from 'class-transformer';

export class ActivateAccountDto {
	@Expose()
	accessToken: string;

	@Expose()
	refreshToken: string;
}
