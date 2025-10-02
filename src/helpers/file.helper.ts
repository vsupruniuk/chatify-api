import * as fs from 'fs';
import * as path from 'path';

import { JWTPayloadDto } from '@dtos/jwt';

import { DateHelper } from '@helpers';

/**
 * Helper class for actions related to static files
 */
export class FileHelper {
	private static ACCEPTABLE_FILE_EXTENSIONS: string[] = ['jpg', 'jpeg', 'png', 'svg', 'webp'];

	/**
	 * Validate if file extension is acceptable
	 * @param file - uploaded file
	 * @param callback - callback that handle file accepting
	 */
	public static validateFileExtension(
		file: Express.Multer.File,
		callback: (error: Error | null, acceptFile: boolean) => void,
	): void {
		const fileExtension: string = file.originalname.split('.').at(-1) || '';

		callback(null, this.ACCEPTABLE_FILE_EXTENSIONS.includes(fileExtension));
	}

	/**
	 * Change the file name to unique and save
	 * @param user - authorized user JWT payload
	 * @param file - file uploaded by user
	 * @param callback - callback that handle file saving
	 */
	public static renameAndSave(
		user: JWTPayloadDto,
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
	 * Delete public file by given name
	 * @param fileName - public file name which should be deleted
	 */
	public static deleteFile(fileName: string): void {
		return fs.unlinkSync(path.join('public', fileName));
	}
}
