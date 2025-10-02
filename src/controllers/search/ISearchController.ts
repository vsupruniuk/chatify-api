import { UserDto } from '@dtos/users';

/**
 * Interface representing public methods of search controller
 */
export interface ISearchController {
	findUsers(nickname: string, page?: number, take?: number): Promise<UserDto[]>;
}
