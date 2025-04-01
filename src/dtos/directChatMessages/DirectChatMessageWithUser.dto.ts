import { Expose, Type } from 'class-transformer';
import { UserDto } from '@dtos/users/UserDto';

export class DirectChatMessageWithUserDto {
	@Expose()
	public id: string;

	@Expose()
	public dateTime: string;

	@Expose()
	public messageText: string;

	@Expose()
	@Type(() => UserDto)
	public sender: UserDto;
}
