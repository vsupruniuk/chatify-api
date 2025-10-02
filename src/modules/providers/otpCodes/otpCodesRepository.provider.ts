import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { OTPCodesRepository } from '@repositories';

export const otpCodesRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_OTP_CODES_REPOSITORY,
	useClass: OTPCodesRepository,
};
