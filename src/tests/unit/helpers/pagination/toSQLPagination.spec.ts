import { PaginationHelper } from '@helpers';

describe('Pagination helper', (): void => {
	describe('To sql pagination', (): void => {
		it('should return sql pagination object with correct data', (): void => {
			const pagination = PaginationHelper.toSQLPagination(1, 5);

			expect(pagination).toEqual({ skip: 0, take: 5 });
		});

		it('should use default values for page and take', (): void => {
			const pagination = PaginationHelper.toSQLPagination();

			expect(pagination).toEqual({ skip: 0, take: 10 });
		});
	});
});
