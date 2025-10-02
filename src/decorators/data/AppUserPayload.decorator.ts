import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { GlobalTypes } from '@customTypes';

/**
 * Get authorized user properties and return as parameter in controller method
 */
export const AppUserPayload = createParamDecorator((_, ctx: ExecutionContext) => {
	const request: GlobalTypes.TAuthorizedRequest = ctx.switchToHttp().getRequest();

	return request.user;
});
