import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { OtpCodesService } from '@services';

export const otpCodesServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_OTP_CODES_SERVICE,
	useClass: OtpCodesService,
};
