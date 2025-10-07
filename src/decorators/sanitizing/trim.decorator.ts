import { Transform } from 'class-transformer';
import { TransformFnParams } from 'class-transformer/types/interfaces';

export const Trim = (): PropertyDecorator => {
	return Transform((params: TransformFnParams) => {
		if (typeof params.value === 'string') {
			return params.value.trim();
		}

		return params.value;
	});
};
