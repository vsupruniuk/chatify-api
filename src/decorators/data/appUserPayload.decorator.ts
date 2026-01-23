import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthTypes } from '@customTypes';

/**
 * Parameter decorator that returns JWT payload of authorized used attached to the request.
 * Auth middleware must attach the user payload before using this decorator
 * @returns JwtPayloadDto - user payload obtained from access token
 */
export const AppUserPayload = createParamDecorator((_, ctx: ExecutionContext) => {
	const request: AuthTypes.TAuthorizedRequest = ctx.switchToHttp().getRequest();

	return request.user;
});
