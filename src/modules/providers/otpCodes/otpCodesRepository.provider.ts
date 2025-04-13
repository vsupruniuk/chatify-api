import { CustomProviders } from '@enums/CustomProviders.enum';
import { OTPCodesRepository } from '@repositories/otpCodes/OTPCodes.repository';
import { ClassProvider } from '@nestjs/common';

export const otpCodesRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_OTP_CODES_REPOSITORY,
	useClass: OTPCodesRepository,
};
