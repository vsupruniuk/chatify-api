import { Expose, Type } from 'class-transformer';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';
import { DirectChatIdDto } from '@DTO/directChat/DirectChatId.dto';

export class DirectChatMessageWithChatDto {
	@Expose()
	id: string;

	@Expose()
	dateTime: string;

	@Expose()
	messageText: string;

	@Expose()
	@Type(() => DirectChatIdDto)
	directChat: DirectChatIdDto;

	@Expose()
	@Type(() => UserPublicDto)
	sender: UserPublicDto;
}
