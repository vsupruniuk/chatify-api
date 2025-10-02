import { Expose, Type } from 'class-transformer';

import { UserDto } from '@dtos/users';

export class DirectChatWithUsersDto {
	@Expose()
	public id: string;

	@Expose()
	@Type(() => UserDto)
	public users: UserDto[];
}
