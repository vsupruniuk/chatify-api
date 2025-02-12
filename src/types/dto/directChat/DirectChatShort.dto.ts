import { Expose, Type } from 'class-transformer';
import { UserPublicDto } from '../users/UserPublic.dto';
import { DirectChatMessageShortDto } from '../directChatMessages/DirectChatMessageShort.dto';

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
