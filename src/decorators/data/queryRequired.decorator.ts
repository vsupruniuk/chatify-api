import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext,
	PipeTransform,
} from '@nestjs/common';

import { Request } from 'express';

/**
 * Take query parameter value by the name, applies all pipes and return the value
 * @throws BadRequestException - if query parameter is not provided
 * @returns string - query parameter value
 */
export const QueryRequired = createParamDecorator(
	(queryName: string, ctx: ExecutionContext, ...pipes: PipeTransform[]) => {
		const request: Request = ctx.switchToHttp().getRequest();

		let queryParamData = request.query[queryName];

		if (!queryParamData) {
			throw new BadRequestException(`Missing required query parameter: ${queryName}`);
		}

		pipes.forEach((pipe: PipeTransform) => {
			queryParamData = pipe.transform(queryParamData, { type: 'query' });
		});

		return queryParamData;
	},
);
