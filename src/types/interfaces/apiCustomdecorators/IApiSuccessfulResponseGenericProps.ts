export interface IApiSuccessfulResponseGenericProps<T> {
	status: number;
	description: string;
	dataType: T;
}
