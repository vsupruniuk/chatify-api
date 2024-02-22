export interface ISuccessfulRequest<T extends object> {
	code: number;
	data: T[] | null[];
}
