import { UserDto } from '@dtos/users';

import { PaginationTypes } from '@customTypes';

/**
 * Interface representing public methods of search controller
 */
export interface ISearchController {
	findUsers(nickname: string, pagination: PaginationTypes.IPagination): Promise<UserDto[]>;
}
