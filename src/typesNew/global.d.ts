import { Request } from 'express';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';

export declare namespace GlobalTypes {
	type TAuthorizedRequest = Request & { user: JWTPayloadDto };
}
