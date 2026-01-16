import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthTypes } from '@customTypes';

/**
 * Get authorized user properties and return as parameter in controller method
 */
export const AppUserPayload = createParamDecorator((_, ctx: ExecutionContext) => {
	const request: AuthTypes.TAuthorizedRequest = ctx.switchToHttp().getRequest();

	return request.user;
});
