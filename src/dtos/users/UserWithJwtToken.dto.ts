import { Expose, Type } from 'class-transformer';

import { JWTTokenDto } from '@dtos/jwt';

export class UserWithJwtTokenDto {
	@Expose()
	public id: string;

	@Expose()
	public about: string | null;

	@Expose()
	public avatarUrl: string | null;

	@Expose()
	public email: string;

	@Expose()
	public firstName: string;

	@Expose()
	public lastName: string | null;

	@Expose()
	public nickname: string;

	@Expose()
	@Type(() => JWTTokenDto)
	public jwtToken: JWTTokenDto;
}
