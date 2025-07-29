import { FileHelper } from '@helpers/file.helper';
import { BadRequestException } from '@nestjs/common';

describe('File helper', (): void => {
	describe('Validate file extension', (): void => {
		const file: Express.Multer.File = { originalname: 'user.png' } as Express.Multer.File;
		const callback: jest.Mock = jest.fn();

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call callback without error and true, if file extension is valid', (): void => {
			FileHelper.validateFileExtension(file, callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenNthCalledWith(1, null, true);
		});

		it('should call callback with a BadRequestException and false if file extension is not valid', (): void => {
			FileHelper.validateFileExtension(
				{ originalname: 'user.txt' } as Express.Multer.File,
				callback,
			);

			expect(callback).toHaveBeenCalledTimes(1);

			expect(callback.mock.calls[0][0]).toBeInstanceOf(BadRequestException);
			expect(callback.mock.calls[0][1]).toBe(false);
		});
	});
});
