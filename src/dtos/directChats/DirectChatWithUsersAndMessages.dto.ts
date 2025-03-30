import { Expose, Type } from 'class-transformer';
import { DirectChatMessageDto } from '@dtos/directChatMessages/DirectChatMessage.dto';
import { UserDto } from '@dtos/users/UserDto';

export class DirectChatWithUsersAndMessagesDto {
	@Expose()
	public id: string;

	@Expose()
	@Type(() => UserDto)
	public users: UserDto[];

	@Expose()
	@Type(() => DirectChatMessageDto)
	public messages: DirectChatMessageDto[];
}
