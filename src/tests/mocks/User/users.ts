import { User } from '@Entities/User.entity';
import { plainToInstance } from 'class-transformer';

export const users: User[] = [
	plainToInstance(User, <User>{
		id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
		about: null,
		avatarUrl: null,
		createdAt: '2023-11-24 18:25:00',
		email: 'tony@mail.com',
		firstName: 'Tony',
		isActivated: false,
		lastName: 'Stark',
		nickname: 't.stark',
		password: 'qwertyA1',
		updatedAt: '2023-11-24 18:25:00',
		accountSettingsId: '1001',
		OTPCodeId: '1',
	}),

	plainToInstance(User, <User>{
		id: 'f46845d7-90af-4c29-8e1a-221c90b33852',
		about: 'Thor - the strongest avenger',
		avatarUrl: null,
		createdAt: '2023-11-24 18:24:00',
		email: 'thor@mail.com',
		firstName: 'Thor',
		isActivated: false,
		lastName: 'Odinson',
		nickname: 't.odinson',
		password: 'qwertyA1',
		updatedAt: '2023-11-24 18:24:00',
		accountSettingsId: '1002',
		OTPCodeId: '2',
	}),

	plainToInstance(User, <User>{
		id: 'f42845d7-90af-4c29-8e1a-227c90b33852',
		about: null,
		avatarUrl: null,
		createdAt: '2023-11-24 18:23:00',
		email: 'steven@mail.com',
		firstName: 'Steven',
		isActivated: true,
		lastName: 'Rogers',
		nickname: 's.rogers',
		password: 'qwertyA1',
		updatedAt: '2023-11-24 18:23:00',
		accountSettingsId: '1003',
		OTPCodeId: '3',
	}),
];
