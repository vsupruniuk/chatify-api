import { CustomProviders } from '@enums/CustomProviders.enum';
import { OTPCodesService } from '@services/OTPCodes.service';
import { ClassProvider } from '@nestjs/common';

export const otpCodesServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_OTP_CODES_SERVICE,
	useClass: OTPCodesService,
};
