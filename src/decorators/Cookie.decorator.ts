import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookie = createParamDecorator((name: string, ctx: ExecutionContext) => {
	const request: Request = ctx.switchToHttp().getRequest<Request>();

	return name ? request.cookies[name] : request.cookies;
});
