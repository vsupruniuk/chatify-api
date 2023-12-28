import { plainToInstance } from 'class-transformer';

import { OTPCode } from '@Entities/OTPCode.entity';

export const otpCodes: OTPCode[] = [
	plainToInstance(OTPCode, <OTPCode>{
		id: '1662043c-4d4b-4424-ac31-45189dedd099',
		code: 111111,
		expiresAt: '2023-11-24 18:30:00',
	}),
	plainToInstance(OTPCode, <OTPCode>{
		id: '1662043c-4d4b-4424-ac31-35189dedd099',
		code: 222222,
		expiresAt: '2023-11-24 18:30:00',
	}),
	plainToInstance(OTPCode, <OTPCode>{
		id: '1662043c-4d4b-4424-ac31-55189dedd099',
		code: 333333,
		expiresAt: '2023-11-24 18:30:00',
	}),
];
