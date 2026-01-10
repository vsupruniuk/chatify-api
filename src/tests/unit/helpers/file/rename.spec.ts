import { plainToInstance } from 'class-transformer';

import { FileHelper, DateHelper } from '@helpers';

import { User } from '@entities';

import { users } from '@testMocks';

import { JwtPayloadDto } from '@dtos/jwt';
import * as dayjs from 'dayjs';

describe('File helper', (): void => {
	describe('Rename', (): void => {
		const userMock: User = users[0];
		const timestampMock: number = dayjs('2025-07-15 23:45:00').unix();

		const user: JwtPayloadDto = plainToInstance(JwtPayloadDto, userMock, {
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
			FileHelper.rename(user, file, callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenNthCalledWith(
				1,
				null,
				`${user.id}-${timestampMock}.${file.originalname.split('.')[1]}`,
			);
		});
	});
});
