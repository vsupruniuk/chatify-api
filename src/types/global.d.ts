import { Request } from 'express';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { Socket } from 'socket.io';

export declare namespace GlobalTypes {
	type TAuthorizedRequest = Request & { user: JWTPayloadDto };

	type TAuthorizedSocket = Socket & { user: JWTPayloadDto };

	interface IValidationErrorResponse {
		message: string[];
		error: string;
		statusCode: number;
	}
}
