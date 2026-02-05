import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

import { JwtPayloadDto } from '@dtos/jwt';

/**
 * Class with static helper method for actions related to data transformation
 */
export class TransformHelper {
	/**
	 * Convert plain object to an instance of provided DTO class.
	 * Excluded or not exposed properties will be omitted
	 * @param targetDto - ClassConstructor of target DTO class
	 * @param data - plain object that need to transform
	 * @returns TD - data as instance of target DTO
	 * @template TD - target DTO type
	 * @template D - source data type
	 */
	public static toTargetDto<TD, D>(targetDto: ClassConstructor<TD>, data: D): TD {
		return plainToInstance(targetDto, data, { excludeExtraneousValues: true });
	}

	/**
	 * Convert provided data to the shape of JwtPayloadDto
	 * @param data - data for transformation
	 * @returns JwtPayloadDto - object matching the JwtPayloadDto shape.
	 * @template D - object that contains at least all fields defined in JwtPayloadDto
	 */
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
