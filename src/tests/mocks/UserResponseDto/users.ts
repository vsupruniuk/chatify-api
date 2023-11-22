import { UserShortDto } from '@DTO/users/UserShort.dto';
import { plainToClass } from 'class-transformer';

export const users: UserShortDto[] = [
	plainToClass(UserShortDto, <UserShortDto>{
		id: '1',
		about: null,
		avatarUrl: null,
		email: 'tony@mail.com',
		firstName: 'Tony',
		lastName: 'Stark',
		nickname: 't.stark',
		accountSettingsId: '1001',
	}),

	plainToClass(UserShortDto, <UserShortDto>{
		id: '2',
		about: 'Thor - the strongest avenger',
		avatarUrl: null,
		email: 'thor@mail.com',
		firstName: 'Thor',
		lastName: 'Odinson',
		nickname: 't.odinson',
		accountSettingsId: '1002',
	}),

	plainToClass(UserShortDto, <UserShortDto>{
		id: '3',
		about: null,
		avatarUrl: null,
		email: 'steven@mail.com',
		firstName: 'Steven',
		lastName: 'Rogers',
		nickname: 's.rogers',
		accountSettingsId: '1003',
	}),
];
