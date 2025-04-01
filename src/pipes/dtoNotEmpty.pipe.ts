import { BadRequestException, PipeTransform } from '@nestjs/common';

export class DtoNotEmptyPipe implements PipeTransform {
	public transform<T extends object>(value: T): T {
		if (!Object.keys(value).length) {
			throw new BadRequestException('Request body must contains at least 1 value');
		}

		return value;
	}
}
