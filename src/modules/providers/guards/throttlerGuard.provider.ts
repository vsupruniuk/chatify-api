import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ClassProvider } from '@nestjs/common';

export const throttlerGuardProvider: ClassProvider = {
	provide: APP_GUARD,
	useClass: ThrottlerGuard,
};
