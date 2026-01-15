export declare namespace PaginationTypes {
	interface IPagination {
		page: number;
		take: number;
	}

	interface IPaginationQueries extends Partial<Record<keyof IPagination, string>> {}

	interface ISqlPagination extends Omit<IPagination, 'page'> {
		skip: number;
	}
}
