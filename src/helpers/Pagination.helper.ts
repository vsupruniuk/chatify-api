import { PaginationTypes } from '@customTypes';

export class PaginationHelper {
	/**
	 * Method for transforming pagination query parameters to SQL format parameters
	 * @param page
	 * @param take
	 */
	public static toSqlPagination(page: number, take: number): PaginationTypes.ISqlPagination {
		return {
			skip: page * take - take,
			take,
		};
	}
}
