import { Expose, Type } from 'class-transformer';

import { DirectChatMessageWithUserDto } from '@dtos/directChatMessages';
import { UserDto } from '@dtos/users';

export class DirectChatWithUsersAndMessagesDto {
	@Expose()
	public id: string;

	@Expose()
	@Type(() => UserDto)
	public users: UserDto[];

	@Expose()
	@Type(() => DirectChatMessageWithUserDto)
	public messages: DirectChatMessageWithUserDto[];
}
