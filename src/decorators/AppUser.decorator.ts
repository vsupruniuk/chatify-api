import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TUserPayload } from '@Types/users/TUserPayload';
import { Request } from 'express';

/**
 * Get authorized user properties and return as parameter in controller method
 */
export const AppUserPayload = createParamDecorator((_, ctx: ExecutionContext) => {
	const request: Request & TUserPayload = ctx.switchToHttp().getRequest();

	return request.user;
});
