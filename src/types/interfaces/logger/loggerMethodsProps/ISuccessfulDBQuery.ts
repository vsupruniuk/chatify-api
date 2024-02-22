export interface ISuccessfulDBQuery<T extends object> {
	method: string;
	repository: string;
	data: T | T[] | null;
}
