import { Expose, Type } from 'class-transformer';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';
import { DirectChatUsersDto } from '@DTO/directChat/DirectChatUsers.dto';

export class DirectChatMessageWithChatDto {
	@Expose()
	public id: string;

	@Expose()
	public dateTime: string;

	@Expose()
	public messageText: string;

	@Expose()
	@Type(() => DirectChatUsersDto)
	public directChat: DirectChatUsersDto;

	@Expose()
	@Type(() => UserPublicDto)
	public sender: UserPublicDto;
}
