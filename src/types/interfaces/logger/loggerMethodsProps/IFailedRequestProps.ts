import { ValidationErrorField } from '@Responses/errors/ValidationErrorField';

export interface IFailedRequestProps {
	code: number;
	title: string;
	errors: ValidationErrorField[];
}
