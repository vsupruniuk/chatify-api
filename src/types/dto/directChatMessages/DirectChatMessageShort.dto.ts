import { Expose, Type } from 'class-transformer';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';

export class DirectChatMessageShortDto {
	@Expose()
	id: string;

	@Expose()
	dateTime: string;

	@Expose()
	messageText: string;

	@Expose()
	@Type(() => UserPublicDto)
	sender: UserPublicDto;
}
