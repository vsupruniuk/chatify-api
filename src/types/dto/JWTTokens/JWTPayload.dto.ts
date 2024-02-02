import { Expose } from 'class-transformer';

export class JWTPayloadDto {
	@Expose()
	id: string;

	@Expose()
	email: string;

	@Expose()
	firstName: string;

	@Expose()
	lastName: string | null;

	@Expose()
	nickname: string;
}
