import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { map, Observable } from 'rxjs';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

import { ResponseStatus } from '@enums';

/**
 * Interceptor that runs after each successful request, and map all responses into single, structured form
 */
@Injectable()
export class ResponseTransformInterceptor<T = object> implements NestInterceptor {
	public intercept(
		_context: ExecutionContext,
		next: CallHandler<T>,
	): Observable<SuccessfulResponseResult<T | null>> {
		return next.handle().pipe(
			map((data) => {
				const responseResult: SuccessfulResponseResult<T | null> = new SuccessfulResponseResult(
					ResponseStatus.SUCCESS,
				);

				responseResult.data = data ?? null;

				return responseResult;
			}),
		);
	}
}
