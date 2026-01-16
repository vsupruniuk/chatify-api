import { Expose } from 'class-transformer';

export class JwtTokenDto {
	@Expose()
	public id: string;

	@Expose()
	public token: string | null;
}
