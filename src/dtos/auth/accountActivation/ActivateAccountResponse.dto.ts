import { Expose } from 'class-transformer';

export class ActivateAccountResponseDto {
	@Expose()
	accessToken: string;
}
