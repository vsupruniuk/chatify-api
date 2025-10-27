import { UserDto } from '@dtos/users';

import { GlobalTypes } from '@customTypes';

/**
 * Interface representing public methods of search controller
 */
export interface ISearchController {
	findUsers(nickname: string, pagination: GlobalTypes.IPagination): Promise<UserDto[]>;
}
