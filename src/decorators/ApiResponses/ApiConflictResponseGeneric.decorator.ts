import { applyDecorators, Type } from '@nestjs/common';
import { ApiConflictResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

import { IApiFailedResponseGenericProps } from '@Interfaces/apiCustomdecorators/IApiFailedResponseGenericProps';

import { ErrorResponseResult } from '@Responses/errorResponses/ErrorResponseResult';

/**
 * Custom decorator used for swagger documentation, to mark response object with generic types
 * @param status - Http response status code
 * @param description - Response text description
 * @param errorType - Custom type of error
 * @constructor
 */
export const ApiConflictResponseGeneric = <T extends Type<unknown>>({
	status,
	description,
	errorType,
}: IApiFailedResponseGenericProps<T>) =>
	applyDecorators(
		ApiExtraModels(ErrorResponseResult, errorType),
		ApiConflictResponse({
			status,
			description,
			schema: {
				allOf: [
					{ $ref: getSchemaPath(ErrorResponseResult) },
					{
						properties: {
							errors: {
								type: 'array',
								items: { $ref: getSchemaPath(errorType) },
							},
						},
					},
				],
			},
		}),
	);
