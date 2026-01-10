import { FileField } from '@enums';

export const filesConfig = {
	[FileField.USER_AVATAR]: {
		fileSize: 10 * 1024 * 1024,
		files: 1,
		acceptableFileExtensions: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
	},
} as const;
