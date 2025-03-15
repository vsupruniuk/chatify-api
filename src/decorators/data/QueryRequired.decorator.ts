import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const QueryRequired = createParamDecorator((queryName: string, ctx: ExecutionContext) => {
	const request: Request = ctx.switchToHttp().getRequest();
	const queryParamData = request.query[queryName];

	if (!queryParamData) {
		throw new BadRequestException(`Missing required query parameter: ${queryName}`);
	}

	return queryParamData;
});
