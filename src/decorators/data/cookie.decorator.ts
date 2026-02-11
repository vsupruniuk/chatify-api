import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Request } from 'express';

/**
 * Get and return a cookie value by its name
 * @returns string - cookie value
 */
export const Cookie = createParamDecorator((name: string, ctx: ExecutionContext) => {
	const request: Request = ctx.switchToHttp().getRequest<Request>();

	return request.cookies[name] as string;
});
