export declare namespace GlobalTypes {
	interface IValidationErrorResponse {
		message: string[];
		error: string;
		statusCode: number;
	}

	interface IMetadataArguments<T = unknown> {
		[key: string]: {
			index: number;
			factory: CallableFunction;
			data: T;
		};
	}
}
