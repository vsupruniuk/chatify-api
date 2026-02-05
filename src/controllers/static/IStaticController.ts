import { StreamableFile } from '@nestjs/common';

/**
 * Controller interface for actions with static files
 */
export interface IStaticController {
	/**
	 * Get static file from the API
	 * @param fileName - static file name for retrieving
	 * @throws NotFoundException - if file was not found
	 * @returns StreamableFile - file content
	 */
	getFile(fileName: string): StreamableFile;
}
