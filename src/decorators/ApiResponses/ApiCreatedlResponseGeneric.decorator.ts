import { applyDecorators, Type } from '@nestjs/common';

import { ApiCreatedResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

import { IApiSuccessfulResponseGenericProps } from '@Interfaces/apiCustomdecorators/IApiSuccessfulResponseGenericProps';

import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';

/**
 * Custom decorator used for swagger documentation, to mark response object with generic types
 * @param status - Http response status code
 * @param description - Response text description
 * @param dataType - Custom type of data
 * @constructor
 */
export const ApiCreatedResponseGeneric = <T extends Type<unknown>>({
	status,
	description,
	dataType,
}: IApiSuccessfulResponseGenericProps<T>) =>
	applyDecorators(
		ApiExtraModels(SuccessfulResponseResult, dataType),
		ApiCreatedResponse({
			status,
			description,
			schema: {
				allOf: [
					{ $ref: getSchemaPath(SuccessfulResponseResult) },
					{
						properties: {
							data: {
								type: 'array',
								items: { $ref: getSchemaPath(dataType) },
							},
						},
					},
				],
			},
		}),
	);
