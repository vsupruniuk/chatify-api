import { ExecutionContext } from '@nestjs/common';
import { AppUserPayload } from '@decorators/data/AppUserPayload.decorator';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { plainToInstance } from 'class-transformer';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { MetadataHelper } from '@testHelpers/Metadata.helper';

describe('App user payload decorator', () => {
	const userMock: User = users[2];
	const userPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
		excludeExtraneousValues: true,
	});

	const executionContext: ExecutionContext = {
		switchToHttp: () => ({
			getRequest: () => ({
				user: userPayload,
			}),
		}),
	} as ExecutionContext;

	it('should be defined', (): void => {
		expect(AppUserPayload).toBeDefined();
	});

	it('should be a function', (): void => {
		expect(AppUserPayload).toBeInstanceOf(Function);
	});

	it('should return authorized user data from the request object', () => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(AppUserPayload);

		const result: JWTPayloadDto = factory(null, executionContext);

		expect(result).toEqual(userPayload);
	});
});
