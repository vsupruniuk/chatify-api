import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { plainToInstance } from 'class-transformer';
import { directChats } from '@TestMocks/DirectChat/directChats';
import { users } from '@TestMocks/User/users';

export const directChatsMessages: DirectChatMessage[] = [
	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: 'a25d0f16-8255-4cf4-a06a-167271bd7720',
		createdAt: '2024-08-03 10:00:00',
		dateTime: '2024-08-03 10:00:00',
		messageText: 'Tony, what if we lose?',
		updatedAt: '2024-08-03 10:00:00',
		directChat: directChats[0],
		sender: users[3],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: '49004822-0135-4d96-9ce1-aa405d01b47b',
		createdAt: '2024-08-03 10:01:00',
		dateTime: '2024-08-03 10:01:00',
		messageText: "We'll lose together.",
		updatedAt: '2024-08-03 10:01:00',
		directChat: directChats[0],
		sender: users[2],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: '80e07b24-2995-4fa0-997a-dacbc6246922',
		createdAt: '2024-08-03 10:02:00',
		dateTime: '2024-08-03 10:02:00',
		messageText: 'You sure about this?',
		updatedAt: '2024-08-03 10:02:00',
		directChat: directChats[0],
		sender: users[3],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: 'a19fda33-2683-49c2-b9f0-477378620036',
		createdAt: '2024-08-03 10:03:00',
		dateTime: '2024-08-03 10:03:00',
		messageText: "I've got a plan: attack.",
		updatedAt: '2024-08-03 10:03:00',
		directChat: directChats[0],
		sender: users[2],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: '3348879e-ef55-43c4-9e91-d54b7432244e',
		createdAt: '2024-08-03 10:04:00',
		dateTime: '2024-08-03 10:04:00',
		messageText: 'I can do this all day.',
		updatedAt: '2024-08-03T10:04:00Z',
		directChat: directChats[0],
		sender: users[3],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: '20cae8bd-d384-44da-9e40-60619da93169',
		createdAt: '2024-08-03 10:05:00',
		dateTime: '2024-08-03 10:05:00',
		messageText: 'Hulk smash!',
		updatedAt: '2024-08-03 10:05:00',
		directChat: directChats[1],
		sender: users[4],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: '1cfdd139-fcd7-4927-b09e-278f8f0abdfe',
		createdAt: '2024-08-03 10:06:00',
		dateTime: '2024-08-03 10:06:00',
		messageText: 'Puny god.',
		updatedAt: '2024-08-03 10:06:00',
		directChat: directChats[1],
		sender: users[4],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: 'f34f0994-c773-4af4-a5e9-1bd1a162c305',
		createdAt: '2024-08-03 10:07:00',
		dateTime: '2024-08-03 10:07:00',
		messageText: 'We have a Hulk.',
		updatedAt: '2024-08-03 10:07:00',
		directChat: directChats[1],
		sender: users[5],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: 'dab57804-f21b-4e83-bdc0-d8714191240a',
		createdAt: '2024-08-03 10:08:00',
		dateTime: '2024-08-03 10:08:00',
		messageText: "That's my secret, Cap: I'm always angry.",
		updatedAt: '2024-08-03 10:08:00',
		directChat: directChats[1],
		sender: users[4],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: '25e31c5a-7dcc-4745-b5c3-c829a4da6b0c',
		createdAt: '2024-08-03 10:09:00',
		dateTime: '2024-08-03 10:09:00',
		messageText: 'Just like Budapest, all over again.',
		updatedAt: '2024-08-03 10:09:00',
		directChat: directChats[1],
		sender: users[5],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: 'f4cec4a6-3e7a-4272-8711-c2ecc5d6731c',
		createdAt: '2024-08-03 10:10:00',
		dateTime: '2024-08-03 10:10:00',
		messageText: 'We must be ready.',
		updatedAt: '2024-08-03 10:10:00',
		directChat: directChats[2],
		sender: users[6],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: '53f44075-b225-4ff6-801b-f5cc54ee7a12',
		createdAt: '2024-08-03 10:11:00',
		dateTime: '2024-08-03 10:11:00',
		messageText: 'Ready for what?',
		updatedAt: '2024-08-03 10:11:00',
		directChat: directChats[2],
		sender: users[7],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: '97e22c28-3ea9-4254-a7e7-5e34ecc46009',
		createdAt: '2024-08-03 10:12:00',
		dateTime: '2024-08-03 10:12:00',
		messageText: 'For whatever lies ahead.',
		updatedAt: '2024-08-03 10:12:00',
		directChat: directChats[2],
		sender: users[6],
	}),

	plainToInstance(DirectChatMessage, <DirectChatMessage>{
		id: '5019b7b9-f3ab-46e5-bcc2-af0e321ee964',
		createdAt: '2024-08-03 10:13:00',
		dateTime: '2024-08-03 10:13:00',
		messageText: "Let's give them hell.",
		updatedAt: '2024-08-03 10:13:00',
		directChat: directChats[2],
		sender: users[6],
	}),
];
