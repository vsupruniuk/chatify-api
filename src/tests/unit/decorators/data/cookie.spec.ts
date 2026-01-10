import { ExecutionContext } from '@nestjs/common';

import { MetadataHelper } from '@testHelpers';

import { Cookie } from '@decorators/data';

describe('Cookie decorator', (): void => {
	const cookies: Record<string, string> = {
		refreshToken: 'refreshTokenValue',
		accessToken: 'accessTokenValue',
	};

	const executionContext: ExecutionContext = {
		switchToHttp: () => ({
			getRequest: () => ({
				cookies,
			}),
		}),
	} as ExecutionContext;

	it('should return a cookie value by the name', (): void => {
		const factory: CallableFunction = MetadataHelper.getParamDecoratorFactory(Cookie);

		const cookie: string = factory('refreshToken', executionContext);

		expect(cookie).toBe(cookies.refreshToken);
	});
});
