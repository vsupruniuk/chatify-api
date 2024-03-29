import { CustomProviders } from '@Enums/CustomProviders.enum';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';

export const otpCodesRepositoryProvider = {
	provide: CustomProviders.I_OTP_CODES_REPOSITORY,
	useClass: OTPCodesRepository,
};
