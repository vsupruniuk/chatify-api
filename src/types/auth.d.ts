import { Request } from 'express';
import { Socket } from 'socket.io';

import { JwtPayloadDto } from '@dtos/jwt';

export declare namespace AuthTypes {
	type TAuthorizedRequest = Request & { user: JwtPayloadDto };

	type TAuthorizedSocket = Socket & { user: JwtPayloadDto };
}
