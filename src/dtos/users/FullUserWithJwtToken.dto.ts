import { Expose, Type } from 'class-transformer';

import { JwtTokenDto } from '@dtos/jwt';

export class FullUserWithJwtTokenDto {
	@Expose()
	public id: string;

	@Expose()
	public about: string | null;

	@Expose()
	public avatarUrl: string | null;

	@Expose()
	public createdAt: string;

	@Expose()
	public email: string;

	@Expose()
	public firstName: string;

	@Expose()
	public isActivated: boolean;

	@Expose()
	public lastName: string | null;

	@Expose()
	public nickname: string;

	@Expose()
	public password: string;

	@Expose()
	public updatedAt: string;

	@Expose()
	@Type(() => JwtTokenDto)
	public jwtToken: JwtTokenDto;
}
