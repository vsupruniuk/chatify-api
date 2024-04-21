export interface IIncomingRequestProps<T extends object> {
	requestMethod: string;
	controller: string;
	body?: T;
	queryParams?: { [key: string]: string | number | undefined };
	cookies?: { [key: string]: string };
}
