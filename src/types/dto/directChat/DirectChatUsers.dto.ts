import { Expose, Type } from 'class-transformer';
import { UserPublicDto } from '../users/UserPublic.dto';

export class DirectChatUsersDto {
	@Expose()
	public id: string;

	@Expose()
	@Type(() => UserPublicDto)
	public users: UserPublicDto[];
}
