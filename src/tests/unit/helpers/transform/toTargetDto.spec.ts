import { TransformHelper } from '@helpers/transform.helper';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { UserDto } from '@dtos/users/UserDto';
import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

describe('Transform helper', (): void => {
	describe('To target dto', (): void => {
		const userMock: User = users[3];
		const targetDto: ClassConstructor<UserDto> = UserDto;

		const userDto: UserDto = plainToInstance(UserDto, userMock, { excludeExtraneousValues: true });

		it('should be defined', (): void => {
			expect(TransformHelper.toTargetDto).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(TransformHelper.toTargetDto).toBeDefined();
		});

		it('should return null if provided data is null', (): void => {
			const result: UserDto = TransformHelper.toTargetDto(targetDto, null);

			expect(result).toBeNull();
		});

		it('should omit redundant data and not change the rest', (): void => {
			const result: UserDto = TransformHelper.toTargetDto(targetDto, userMock);

			expect(result).toEqual(userDto);
		});

		it('should return response as instance of provided dto', (): void => {
			const result: UserDto = TransformHelper.toTargetDto(targetDto, userMock);

			expect(result).toBeInstanceOf(targetDto);
		});
	});
});
