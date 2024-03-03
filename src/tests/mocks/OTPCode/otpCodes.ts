import { User } from '@Entities/User.entity';
import { plainToInstance } from 'class-transformer';

import { OTPCode } from '@Entities/OTPCode.entity';

export const otpCodes: OTPCode[] = [
	plainToInstance(OTPCode, <OTPCode>{
		id: '1662043c-4d4b-4424-ac31-45189dedd099',
		code: 111111,
		createdAt: '2024-02-28 17:00:00',
		expiresAt: '2023-11-24 18:30:00',
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),
	plainToInstance(OTPCode, <OTPCode>{
		id: '1662043c-4d4b-4424-ac31-35189dedd099',
		code: 222222,
		createdAt: '2024-02-28 17:00:00',
		expiresAt: '2023-11-24 18:30:00',
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),
	plainToInstance(OTPCode, <OTPCode>{
		id: '1662043c-4d4b-4424-ac31-55189dedd099',
		code: null,
		createdAt: '2024-02-28 17:00:00',
		expiresAt: null,
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),
];
