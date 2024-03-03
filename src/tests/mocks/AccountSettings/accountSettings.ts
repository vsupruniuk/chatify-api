import { AccountSettings } from '@Entities/AccountSettings.entity';
import { User } from '@Entities/User.entity';
import { plainToInstance } from 'class-transformer';

export const accountSettings: AccountSettings[] = [
	plainToInstance(AccountSettings, <AccountSettings>{
		id: '1',
		createdAt: '2024-02-28 17:00:00',
		enterIsSend: false,
		notification: false,
		twoStepVerification: true,
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),

	plainToInstance(AccountSettings, <AccountSettings>{
		id: '2',
		createdAt: '2024-02-28 17:00:00',
		enterIsSend: false,
		notification: true,
		twoStepVerification: false,
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),

	plainToInstance(AccountSettings, <AccountSettings>{
		id: '3',
		createdAt: '2024-02-28 17:00:00',
		enterIsSend: true,
		notification: false,
		twoStepVerification: false,
		updatedAt: '2024-02-28 17:00:00',
		user: {} as User,
	}),
];
