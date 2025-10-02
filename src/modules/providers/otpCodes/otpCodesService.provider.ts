import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { OTPCodesService } from '@services';

export const otpCodesServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_OTP_CODES_SERVICE,
	useClass: OTPCodesService,
};
