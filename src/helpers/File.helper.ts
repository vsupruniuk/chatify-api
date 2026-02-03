import * as fs from 'node:fs';
import * as path from 'node:path';

import { JwtPayloadDto } from '@dtos/jwt';

import { DateHelper } from '@helpers';

import { filesConfig } from '@configs';

import { FileField } from '@enums';

import { FileTypes } from '@customTypes';

/**
 * Class with static helper methods for actions with files
 */
export class FileHelper {
	/**
	 * Validate file extension for the list of available for specific file field and call a callback
	 * @param field - file field for which file extension must be validated
	 * @param file - file to validate
	 * @param callback - callback that will be called with error or null and boolean value,
	 * depends on if it acceptable or not
	 */
	public static validateFileExtension<F extends FileField>(
		field: F,
		file: Express.Multer.File,
		callback: (error: Error | null, acceptFile: boolean) => void,
	): void {
		const fileExtension: string = file.originalname.split('.').at(-1) || '';
		const isAllowed = filesConfig[field].acceptableFileExtensions.includes(
			fileExtension as FileTypes.AcceptableImageExtensions,
		);

		callback(null, isAllowed);
	}

	/**
	 * Rename file to user-specific unique name
	 * @param user - payload retrieved from access JWT token
	 * @param file - file to rename
	 * @param callback - callback that will be called with the new file name
	 */
	public static rename(
		user: JwtPayloadDto,
		file: Express.Multer.File,
		callback: (error: Error | null, filename: string) => void,
	): void {
		const fileExtension: string = file.originalname.split('.').at(-1) || '';
		const userId: string = user.id;
		const timestamp: number = DateHelper.timestampNow();

		const fileName: string = `${userId}-${timestamp}.${fileExtension}`;

		callback(null, fileName);
	}

	/**
	 * Delete a file from the public folder by its name
	 * @param fileName - name of the file to delete
	 */
	public static deleteFile(fileName: string): void {
		return fs.unlinkSync(path.join('public', fileName));
	}
}
