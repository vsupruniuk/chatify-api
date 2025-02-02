import { CustomProviders } from '@Enums/CustomProviders.enum';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { ClassProvider } from '@nestjs/common';

export const otpCodesRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_OTP_CODES_REPOSITORY,
	useClass: OTPCodesRepository,
};
