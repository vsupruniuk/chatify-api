import { Expose } from 'class-transformer';

export class JWTTokenDto {
	@Expose()
	public id: string;

	@Expose()
	public token: string | null;
}
