import { Expose, Type } from 'class-transformer';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';

export class DirectChatUsersDto {
	@Expose()
	id: string;

	@Expose()
	@Type(() => UserPublicDto)
	users: UserPublicDto[];
}
