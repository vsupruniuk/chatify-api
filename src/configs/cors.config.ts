import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig: CorsOptions = {
	origin: process.env.CLIENT_URL,
	credentials: true,
} as const;
