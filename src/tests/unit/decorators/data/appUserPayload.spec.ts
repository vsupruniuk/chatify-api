import { ExecutionContext } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import { AppUserPayload } from '@decorators/data';

import { User } from '@entities';

import { users } from '@testMocks';

import { JWTPayloadDto } from '@dtos/jwt';

import { MetadataHelper } from '@testHelpers';

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

	it('should return authorized user data from the request object', () => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(AppUserPayload);

		const result: JWTPayloadDto = factory(null, executionContext);

		expect(result).toEqual(userPayload);
	});
});
