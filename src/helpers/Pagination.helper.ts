import { PaginationTypes } from '@customTypes';

/**
 * Class with static helper methods for actions with pagination
 */
export class PaginationHelper {
	/**
	 * Transforms incoming parameters into SQL compatible pagination object
	 * @param page - number of page to take
	 * @param take - number of records to take
	 * @returns PaginationTypes.ISqlPagination - SQL compatible pagination object
	 */
	public static toSqlPagination(page: number, take: number): PaginationTypes.ISqlPagination {
		return {
			skip: page * take - take,
			take,
		};
	}
}
