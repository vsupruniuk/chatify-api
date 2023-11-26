export interface IValidationError {
	response: IValidationErrorResponse;
	status: number;
	options: object;
}

export interface IValidationErrorResponse {
	message: string[];
	error: string;
	statusCode: number;
}
