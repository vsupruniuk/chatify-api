export interface IApiFailedResponseGenericProps<T> {
	status: number;
	description: string;
	errorType?: T;
}
