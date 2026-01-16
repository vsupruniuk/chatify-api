import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { OtpCodesRepository } from '@repositories';

export const otpCodesRepositoryProvider: ClassProvider = {
	provide: CustomProvider.CTF_OTP_CODES_REPOSITORY,
	useClass: OtpCodesRepository,
};
