import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Get access token from authorization token and return it as method parameter
 */
export const AccessToken = createParamDecorator((_, ctx: ExecutionContext) => {
	const request: Request = ctx.switchToHttp().getRequest();

	const authHeader: string | undefined = request.headers['authorization'];

	if (!authHeader) {
		return null;
	}

	const [, accessToken] = authHeader.split(' ');

	return accessToken || null;
});
