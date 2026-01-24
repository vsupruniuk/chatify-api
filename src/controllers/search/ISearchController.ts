import { UserDto } from '@dtos/users';

import { PaginationTypes } from '@customTypes';

/**
 * Controller interface for searching users and chats
 */
export interface ISearchController {
	/**
	 * Find activated users by the nickname
	 * @param nickname - user nickname for searching
	 * @param pagination - object with pagination query parameters
	 * @returns Promise<UserDto[]> - all found users matching nickname and pagination parameters
	 */
	findUsers(nickname: string, pagination: PaginationTypes.IPagination): Promise<UserDto[]>;
}
