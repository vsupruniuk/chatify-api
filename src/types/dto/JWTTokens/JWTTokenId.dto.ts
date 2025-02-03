import { Expose } from 'class-transformer';

export class JWTTokenIdDto {
	@Expose()
	public id: string;
}
