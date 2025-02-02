import { ThrottlerGuard } from '@nestjs/throttler';
import { ClassProvider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

export const throttlerGuardProvider: ClassProvider = {
	provide: APP_GUARD,
	useClass: ThrottlerGuard,
};
