import { CustomProviders } from '@Enums/CustomProviders.enum';
import { OTPCodesService } from '@Services/OTPCodes.service';
import { ClassProvider } from '@nestjs/common';

export const otpCodesServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_OTP_CODES_SERVICE,
	useClass: OTPCodesService,
};
