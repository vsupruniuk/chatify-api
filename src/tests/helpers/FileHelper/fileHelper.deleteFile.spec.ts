import { FileHelper } from '@Helpers/file.helper';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs', () => {
	return {
		unlinkSync: jest.fn(),
	};
});

jest.mock('path', () => {
	return {
		join: jest.fn().mockImplementation((...args: string[]): string => args.join('/')),
	};
});

describe('fileHelper', (): void => {
	describe('deleteFile', (): void => {
		const fileName: string = 'avatar.png';
		const filePath: string = 'public/avatar.png';

		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(FileHelper.deleteFile).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(FileHelper.deleteFile).toBeInstanceOf(Function);
		});

		it('should call unlinkSync method from fs package to delete file', (): void => {
			FileHelper.deleteFile(fileName);

			expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
			expect(fs.unlinkSync).toHaveBeenCalledWith(filePath);
		});

		it('should call join method from path package to build path to file', (): void => {
			FileHelper.deleteFile(fileName);

			expect(path.join).toHaveBeenCalledTimes(1);
			expect(path.join).toHaveBeenCalledWith('public', fileName);
		});
	});
});
