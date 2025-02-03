import { Expose } from 'class-transformer';

export class UserPublicDto {
	@Expose()
	public id: string;

	@Expose()
	public avatarUrl: string | null;

	@Expose()
	public firstName: string;

	@Expose()
	public lastName: string | null;

	@Expose()
	public nickname: string;
}
