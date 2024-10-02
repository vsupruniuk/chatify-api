import { Expose, Type } from 'class-transformer';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';
import { DirectChatUsersDto } from '@DTO/directChat/DirectChatUsers.dto';

export class DirectChatMessageWithChatDto {
	@Expose()
	id: string;

	@Expose()
	dateTime: string;

	@Expose()
	messageText: string;

	@Expose()
	@Type(() => DirectChatUsersDto)
	directChat: DirectChatUsersDto;

	@Expose()
	@Type(() => UserPublicDto)
	sender: UserPublicDto;
}
