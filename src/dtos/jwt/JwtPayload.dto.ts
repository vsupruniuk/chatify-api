import { Expose } from 'class-transformer';

export class JwtPayloadDto {
	@Expose()
	public id: string;

	@Expose()
	public email: string;

	@Expose()
	public firstName: string;

	@Expose()
	public lastName: string | null;

	@Expose()
	public nickname: string;
}
