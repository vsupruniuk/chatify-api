import { UserShortDto } from '@DTO/users/UserShort.dto';

/**
 * Interface representing public methods of users repository
 */
export interface IUsersRepository {
	/**
	 * Method for searching one specific user
	 * @param id - user id for searching
	 * @returns UserShortDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getById(id: string): Promise<UserShortDto | null>;
}
