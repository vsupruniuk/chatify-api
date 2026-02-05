import { BadRequestException, PipeTransform } from '@nestjs/common';

/**
 * Pipe for validation if DTO object is empty. In case if yes, pipe will throw the relevant error
 */
export class DtoNotEmptyPipe implements PipeTransform {
	public transform<V extends object>(value: V): V {
		if (Object.keys(value).length === 0) {
			throw new BadRequestException('Request body must contains at least 1 value');
		}

		return value;
	}
}
