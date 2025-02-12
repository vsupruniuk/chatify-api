import { Expose, Type } from 'class-transformer';
import { DirectChatUsersDto } from '../directChat/DirectChatUsers.dto';
import { UserPublicDto } from '../users/UserPublic.dto';

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
