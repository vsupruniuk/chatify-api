import { ExecutionContext } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import { AppUserPayload } from '@decorators/data';

import { User } from '@entities';

import { users } from '@testMocks';

import { JwtPayloadDto } from '@dtos/jwt';

import { MetadataHelper } from '@testHelpers';

describe('App user payload decorator', (): void => {
	const userMock: User = users[2];
	const userPayload: JwtPayloadDto = plainToInstance(JwtPayloadDto, userMock, {
		excludeExtraneousValues: true,
	});

	const executionContext: ExecutionContext = {
		switchToHttp: () => ({
			getRequest: () => ({
				user: userPayload,
			}),
		}),
	} as ExecutionContext;

	it('should return authorized user data from the request object', (): void => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(AppUserPayload);

		const result: JwtPayloadDto = factory(null, executionContext);

		expect(result).toEqual(userPayload);
	});
});
