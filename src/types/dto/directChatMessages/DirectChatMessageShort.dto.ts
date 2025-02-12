import { Expose, Type } from 'class-transformer';
import { UserPublicDto } from '../users/UserPublic.dto';

export class DirectChatMessageShortDto {
	@Expose()
	public id: string;

	@Expose()
	public dateTime: string;

	@Expose()
	public messageText: string;

	@Expose()
	@Type(() => UserPublicDto)
	public sender: UserPublicDto;
}
