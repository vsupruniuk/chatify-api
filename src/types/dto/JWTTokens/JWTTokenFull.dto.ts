import { Expose } from 'class-transformer';

export class JWTTokenFullDto {
	@Expose()
	id: string;

	@Expose()
	token: string;
}
