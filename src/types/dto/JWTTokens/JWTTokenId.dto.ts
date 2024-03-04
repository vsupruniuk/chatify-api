import { Expose } from 'class-transformer';

export class JWTTokenIdDto {
	@Expose()
	id: string;
}
