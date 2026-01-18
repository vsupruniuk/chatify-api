import { FileField } from '@enums';

import { FileTypes } from '@customTypes';

export const filesConfig = {
	[FileField.USER_AVATAR]: {
		fileSize: 8 * 1024 * 1024,
		files: 1,
		acceptableFileExtensions: [
			'jpg',
			'jpeg',
			'png',
			'svg',
			'webp',
		] satisfies FileTypes.AcceptableImageExtensions[],
	},
} as const;
