import { Expose, Type } from 'class-transformer';
import { UserDto } from '@dtos/users/UserDto';
import { DirectChatWithUsersDto } from '@dtos/directChats/DirectChatWithUsers.dto';

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
