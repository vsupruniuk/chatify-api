import { FileHelper } from '@helpers/file.helper';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';

describe.skip('fileHelper', (): void => {
	describe('renameAndSave', (): void => {
		const callback: jest.Mock = jest.fn();

		const file = {
			fieldname: 'file',
			originalname: 'file.png',
			encoding: '7bit',
			mimetype: 'image/png',
		} as Express.Multer.File;

		const userPayload: JWTPayloadDto = {
			id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
			email: 'tony@mail.com',
			firstName: 'Tony',
			lastName: 'Stark',
			nickname: 't.stark',
		};

		const dateTimeMock: string = '2024-03-31 14:50:00';
		const expectedFileName: string = `${userPayload.id}-${new Date(dateTimeMock).getTime()}.png`;

		beforeEach((): void => {
			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(FileHelper.renameAndSave).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(FileHelper.renameAndSave).toBeInstanceOf(Function);
		});

		it('should call callback with null end new file name to save user file', (): void => {
			jest.setSystemTime(new Date(dateTimeMock));

			FileHelper.renameAndSave(userPayload, file, callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith(null, expectedFileName);
		});
	});
});
