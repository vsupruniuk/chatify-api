import { Request } from 'express';
import { Socket } from 'socket.io';

import { JWTPayloadDto } from '@dtos/jwt';

export declare namespace GlobalTypes {
	type TAuthorizedRequest = Request & { user: JWTPayloadDto };

	type TAuthorizedSocket = Socket & { user: JWTPayloadDto };

	interface IValidationErrorResponse {
		message: string[];
		error: string;
		statusCode: number;
	}

	interface IMetadataArguments<T = unknown> {
		[key: string]: {
			index: number;
			factory: CallableFunction;
			data: T;
		};
	}
}
