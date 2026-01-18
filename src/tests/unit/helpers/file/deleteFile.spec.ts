import * as fs from 'node:fs';
import * as path from 'node:path';

import { FileHelper } from '@helpers';

describe('File helper', (): void => {
	describe('delete file', (): void => {
		const fileName: string = 'user.png';

		beforeEach((): void => {
			jest.spyOn(fs, 'unlinkSync').mockImplementation(jest.fn());
			jest.spyOn(path, 'join').mockImplementation((...parts: string[]) => parts.join('/'));
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call join method from path module to build correct path to a folder with public files', (): void => {
			FileHelper.deleteFile(fileName);

			expect(path.join).toHaveBeenCalledTimes(1);
			expect(path.join).toHaveBeenNthCalledWith(1, 'public', fileName);
		});

		it('should call unlink sync method from fs module to delete a file', (): void => {
			FileHelper.deleteFile(fileName);

			expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
			expect(fs.unlinkSync).toHaveBeenNthCalledWith(1, `public/${fileName}`);
		});
	});
});
