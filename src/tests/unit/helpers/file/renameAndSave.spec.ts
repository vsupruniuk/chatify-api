import { plainToInstance } from 'class-transformer';

import { FileHelper, DateHelper } from '@helpers';

import { User } from '@entities';

import { users } from '@testMocks';

import { JWTPayloadDto } from '@dtos/jwt';

describe('File helper', (): void => {
	describe('Rename and save', (): void => {
		const userMock: User = users[0];
		const timestampMock: number = new Date('2025-07-15 23:45:00').getTime() / 1000;

		const user: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const file: Express.Multer.File = { originalname: 'user.png' } as Express.Multer.File;
		const callback: jest.Mock = jest.fn();

		beforeEach((): void => {
			jest.spyOn(DateHelper, 'timestampNow').mockReturnValue(timestampMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call callback with a null and correct file name', (): void => {
			FileHelper.renameAndSave(user, file, callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenNthCalledWith(
				1,
				null,
				`${user.id}-${timestampMock}.${file.originalname.split('.')[1]}`,
			);
		});
	});
});
