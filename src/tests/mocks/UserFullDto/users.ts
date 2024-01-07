import { UserFullDto } from '@DTO/users/UserFull.dto';
import { plainToInstance } from 'class-transformer';

export const users: UserFullDto[] = [
	plainToInstance(UserFullDto, <UserFullDto>{
		id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
		about: null,
		avatarUrl: null,
		email: 'tony@mail.com',
		firstName: 'Tony',
		isActivated: false,
		lastName: 'Stark',
		nickname: 't.stark',
		password: 'qwertyA1',
		accountSettingsId: '1001',
		OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd099',
	}),

	plainToInstance(UserFullDto, <UserFullDto>{
		id: 'f46845d7-90af-4c29-8e1a-221c90b33852',
		about: 'Thor - the strongest avenger',
		avatarUrl: null,
		email: 'thor@mail.com',
		firstName: 'Thor',
		isActivated: false,
		lastName: 'Odinson',
		nickname: 't.odinson',
		password: 'qwertyA1',
		accountSettingsId: '1002',
		OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd000',
	}),

	plainToInstance(UserFullDto, <UserFullDto>{
		id: 'f42845d7-90af-4c29-8e1a-227c90b33852',
		about: null,
		avatarUrl: null,
		email: 'steven@mail.com',
		firstName: 'Steven',
		isActivated: true,
		lastName: 'Rogers',
		nickname: 's.rogers',
		password: 'qwertyA1',
		accountSettingsId: '1003',
		OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd099',
	}),
];
