import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext,
	ParseIntPipe,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { Request } from 'express';

import { GlobalTypes } from '@customTypes';

export const Pagination = createParamDecorator(
	async (_, ctx: ExecutionContext): Promise<GlobalTypes.IPagination> => {
		const httpArgumentsHost: HttpArgumentsHost = ctx.switchToHttp();
		const request: Request = httpArgumentsHost.getRequest();
		const parseIntPipe: ParseIntPipe = new ParseIntPipe({ optional: true });

		const query = request.query as GlobalTypes.IPaginationQueries;
		const pageQuery: number = await parseIntPipe.transform(query.page ?? '1', {
			type: 'query',
		});
		const takeQuery: number = await parseIntPipe.transform(query.take ?? '10', {
			type: 'query',
		});

		if (pageQuery <= 0) {
			throw new BadRequestException('page query parameter must be 1 or greater');
		}

		if (takeQuery <= 0) {
			throw new BadRequestException('take query parameter must be 1 or greater');
		}

		return {
			page: pageQuery,
			take: takeQuery,
		};
	},
);
