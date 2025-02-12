import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { TUserPayload } from '@custom-types/users/TUserPayload';

/**
 * Get authorized user properties and return as parameter in controller method
 */
export const AppUserPayload = createParamDecorator((_, ctx: ExecutionContext) => {
	const request: Request & TUserPayload = ctx.switchToHttp().getRequest();

	return request.user;
});
