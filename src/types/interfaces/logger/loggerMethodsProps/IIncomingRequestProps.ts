export interface IIncomingRequestProps<T extends object> {
	requestMethod: string;
	controller: string;
	body?: T;
	queryParams?: { [key: string]: string };
	cookies?: { [key: string]: string };
}
