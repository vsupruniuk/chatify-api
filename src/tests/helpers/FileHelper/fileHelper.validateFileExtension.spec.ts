import { FileHelper } from '@helpers/file.helper';
import { BadRequestException } from '@nestjs/common';

describe.skip('fileHelper', (): void => {
	describe('validateFileExtension', (): void => {
		const callback: jest.Mock = jest.fn();

		const imageFile = {
			fieldname: 'file',
			originalname: 'file.png',
			encoding: '7bit',
			mimetype: 'image/png',
		} as Express.Multer.File;

		const textFile = {
			fieldname: 'file',
			originalname: 'file.txt',
			encoding: '7bit',
			mimetype: 'text/plain',
		} as Express.Multer.File;

		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(FileHelper.validateFileExtension).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(FileHelper.validateFileExtension).toBeInstanceOf(Function);
		});

		it('should call callback with error and false arguments if file type is not image', (): void => {
			FileHelper.validateFileExtension(textFile, callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith(
				new BadRequestException(['File extension unacceptable|user-avatar']),
				false,
			);
		});

		it('should call callback with error and false arguments if file type is not image', (): void => {
			FileHelper.validateFileExtension(imageFile, callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith(null, true);
		});
	});
});
