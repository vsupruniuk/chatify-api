import { Expose, Type } from 'class-transformer';
import { DirectChatMessageShortDto } from '@DTO/directChatMessages/DirectChatMessageShort.dto';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';

export class DirectChatShortDto {
	@Expose()
	id: string;

	@Expose()
	@Type(() => UserPublicDto)
	users: UserPublicDto[];

	@Expose()
	@Type(() => DirectChatMessageShortDto)
	messages: DirectChatMessageShortDto[];
}
