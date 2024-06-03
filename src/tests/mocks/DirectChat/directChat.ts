import { DirectChat } from '@Entities/DirectChat.entity';
import { plainToInstance } from 'class-transformer';

export const directChat: DirectChat[] = [
	plainToInstance(DirectChat, <DirectChat>{
		id: 'a9bdc525-1c35-48c0-a0c6-79601d842f43',
		createdAt: '2024-05-24 17:00:00',
		updatedAt: '2024-05-24 17:00:00',
	}),
	plainToInstance(DirectChat, <DirectChat>{
		id: '3e253a0e-be8f-41f1-8568-70105319abf0',
		createdAt: '2024-05-24 17:00:00',
		updatedAt: '2024-05-24 17:00:00',
	}),
	plainToInstance(DirectChat, <DirectChat>{
		id: 'ff41a4a5-7f18-4d63-b243-5087f4288583',
		createdAt: '2024-05-24 17:00:00',
		updatedAt: '2024-05-24 17:00:00',
	}),
];
