import { PaginationHelper } from '@helpers/pagination.helper';

describe('Pagination helper', (): void => {
	describe('To sql pagination', (): void => {
		it('should be defined', (): void => {
			expect(PaginationHelper.toSQLPagination).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(PaginationHelper.toSQLPagination).toBeInstanceOf(Function);
		});

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
