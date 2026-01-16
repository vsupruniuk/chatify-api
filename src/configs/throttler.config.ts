import { ThrottlerOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerOptions = {
	ttl: Number(process.env.THROTTLE_TIME_TO_LIVE),
	limit: Number(process.env.THROTTLE_REQUESTS_LIMIT),
} as const;
