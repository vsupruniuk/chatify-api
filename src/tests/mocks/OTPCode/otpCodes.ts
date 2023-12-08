import { plainToInstance } from 'class-transformer';

import { OTPCode } from '@Entities/OTPCode.entity';

export const otpCodes: OTPCode[] = [
	plainToInstance(OTPCode, <OTPCode>{
		id: '1',
		code: 111111,
		expiresAt: '2023-11-24 18:30:00',
	}),
	plainToInstance(OTPCode, <OTPCode>{
		id: '2',
		code: 222222,
		expiresAt: '2023-11-24 18:30:00',
	}),
	plainToInstance(OTPCode, <OTPCode>{
		id: '3',
		code: 333333,
		expiresAt: '2023-11-24 18:30:00',
	}),
];
