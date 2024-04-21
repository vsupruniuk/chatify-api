import { Expose } from 'class-transformer';

export class UserPublicDto {
	@Expose()
	id: string;

	@Expose()
	avatarUrl: string | null;

	@Expose()
	firstName: string;

	@Expose()
	lastName: string | null;

	@Expose()
	nickname: string;
}
