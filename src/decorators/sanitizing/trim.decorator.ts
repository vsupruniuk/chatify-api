import { Transform } from 'class-transformer';
import { TransformFnParams } from 'class-transformer/types/interfaces';

/**
 * Trims all whitespaces for a string value and returns it if the values is a string.
 * Otherwise, returns original value
 * @constructor TransformFnParams - object with information about filed in DTO where this decorator applied
 * @returns trimmed value for strings, original value for everything else
 */
export const Trim = (): PropertyDecorator => {
	return Transform((params: TransformFnParams) => {
		if (typeof params.value === 'string') {
			return params.value.trim();
		}

		return params.value;
	});
};
