import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

import { JwtPayloadDto } from '@dtos/jwt';

/**
 * Helper class for transforming data
 */
export class TransformHelper {
	public static toTargetDto<TD, D>(targetDto: ClassConstructor<TD>, data: D): TD {
		return plainToInstance(targetDto, data, { excludeExtraneousValues: true });
	}

	public static toJwtTokenPayload<D extends JwtPayloadDto>(data: D): JwtPayloadDto {
		return {
			id: data.id,
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
			nickname: data.nickname,
		};
	}
}
