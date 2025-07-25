import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { SuccessfulResponseResult } from '@responses/successfulResponses/SuccessfulResponseResult';
import { ResponseStatus } from '@enums/ResponseStatus.enum';

@Injectable()
export class ResponseTransformInterceptor<T = object> implements NestInterceptor {
	public intercept(
		context: ExecutionContext,
		next: CallHandler<T>,
	): Observable<SuccessfulResponseResult<T | null>> {
		return next.handle().pipe(
			map((data) => {
				const responseResult: SuccessfulResponseResult<T | null> = new SuccessfulResponseResult(
					ResponseStatus.SUCCESS,
				);

				responseResult.data = data ? data : null;

				return responseResult;
			}),
		);
	}
}
