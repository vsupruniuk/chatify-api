import {
	CallHandler,
	ExecutionContext,
	HttpStatus,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
	public intercept(
		context: ExecutionContext,
		next: CallHandler<T[]>,
	): Observable<SuccessfulResponseResult<T>> {
		return next.handle().pipe(
			map((data) => {
				const responseResult: SuccessfulResponseResult<T> = new SuccessfulResponseResult(
					HttpStatus.OK,
					ResponseStatus.SUCCESS,
				);

				responseResult.data = data ? data : [];
				responseResult.dataLength = responseResult.data.length;

				return responseResult;
			}),
		);
	}
}
