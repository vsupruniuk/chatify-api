import {
	BadRequestException,
	createParamDecorator,
	ExecutionContext,
	ParseIntPipe,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { Request } from 'express';

import { PaginationTypes } from '@customTypes';

import { paginationConfig } from '@configs';

/**
 * Accept pagination query parameters, validate them and returns either its own or default values
 * @throws BadRequestException - if page or take query parameters provided but value is less than 1
 * @returns Promise<PaginationTypes.IPagination> - mapped page and take query parameters
 */
export const Pagination = createParamDecorator(
	async (_, ctx: ExecutionContext): Promise<PaginationTypes.IPagination> => {
		const parseIntPipe: ParseIntPipe = new ParseIntPipe({ optional: true });

		const httpArgumentsHost: HttpArgumentsHost = ctx.switchToHttp();
		const request: Request = httpArgumentsHost.getRequest();

		const paginationQueries = request.query as PaginationTypes.IPaginationQueries;

		const pageQuery: number = await parseIntPipe.transform(
			paginationQueries.page ?? paginationConfig.pageQueryDefaultValue,
			{
				type: 'query',
			},
		);

		const takeQuery: number = await parseIntPipe.transform(
			paginationQueries.take ?? paginationConfig.takeQueryDefaultValue,
			{
				type: 'query',
			},
		);

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
