export class PaginationHelper {
	/**
	 * Method for transforming pagination query parameters to SQL format parameters
	 * @param page
	 * @param take
	 */
	public static toSQLPagination(
		page: number = 1,
		take: number = 10,
	): { skip: number; take: number } {
		return {
			skip: page * take - take,
			take,
		};
	}
}
