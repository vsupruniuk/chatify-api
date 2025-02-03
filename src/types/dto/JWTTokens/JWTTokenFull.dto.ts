import { Expose } from 'class-transformer';

export class JWTTokenFullDto {
	@Expose()
	public id: string;

	@Expose()
	public token: string;
}
