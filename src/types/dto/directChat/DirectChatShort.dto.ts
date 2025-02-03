import { Expose, Type } from 'class-transformer';
import { DirectChatMessageShortDto } from '@DTO/directChatMessages/DirectChatMessageShort.dto';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';

export class DirectChatShortDto {
	@Expose()
	public id: string;

	@Expose()
	@Type(() => UserPublicDto)
	public users: UserPublicDto[];

	@Expose()
	@Type(() => DirectChatMessageShortDto)
	public messages: DirectChatMessageShortDto[];
}
