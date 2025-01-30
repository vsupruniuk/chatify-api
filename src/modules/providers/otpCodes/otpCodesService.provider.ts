import { CustomProviders } from '@Enums/CustomProviders.enum';
import { OTPCodesService } from '@Services/OTPCodes.service';

export const otpCodesServiceProvider = {
	provide: CustomProviders.CTF_OTP_CODES_SERVICE,
	useClass: OTPCodesService,
};
