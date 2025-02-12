import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

/**
 * Helper class for transforming data
 */
export class TransformHelper {
	public static toTargetDto<TD, D>(targetDto: ClassConstructor<TD>, data: D | null): TD | null {
		if (!data) {
			return null;
		}

		return plainToInstance(targetDto, data, { excludeExtraneousValues: true });
	}
}
