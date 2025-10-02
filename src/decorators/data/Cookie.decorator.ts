import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Request } from 'express';

/**
 * Return certain cookie by its name or all cookies from request object
 * @param name - cookie name
 * @returns cookie - cookie by its name, may be undefined
 * @returns cookies - whole cookies object, if name not provided
 */
export const Cookie = createParamDecorator((name: string, ctx: ExecutionContext) => {
	const request: Request = ctx.switchToHttp().getRequest<Request>();

	return name ? request.cookies[name] : request.cookies;
});
