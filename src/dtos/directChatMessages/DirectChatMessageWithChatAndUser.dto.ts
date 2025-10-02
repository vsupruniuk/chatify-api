import { Expose, Type } from 'class-transformer';

import { UserDto } from '@dtos/users';
import { DirectChatWithUsersDto } from '@dtos/directChats';

export class DirectChatMessageWithChatAndUserDto {
	@Expose()
	public id: string;

	@Expose()
	public dateTime: string;

	@Expose()
	public messageText: string;

	@Expose()
	@Type(() => DirectChatWithUsersDto)
	public directChat: DirectChatWithUsersDto;

	@Expose()
	@Type(() => UserDto)
	public sender: UserDto;
}
