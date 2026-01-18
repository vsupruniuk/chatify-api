import { BadRequestException, PipeTransform } from '@nestjs/common';

export class DtoNotEmptyPipe implements PipeTransform {
	public transform<V extends object>(value: V): V {
		if (Object.keys(value).length === 0) {
			throw new BadRequestException('Request body must contains at least 1 value');
		}

		return value;
	}
}
