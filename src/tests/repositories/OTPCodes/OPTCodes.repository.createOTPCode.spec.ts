import { InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

import { plainToInstance } from 'class-transformer';

import { connectionSource } from '@DB/typeOrmConfig';

import { CreateOTPCodeDto } from '@DTO/OTPCodes/CreateOTPCode.dto';

import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';

import SpyInstance = jest.SpyInstance;

describe('OTPCodesRepository', (): void => {
	let otpCodesRepository: OTPCodesRepository;

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(connectionSource);
	});

	describe('createOTPCode', (): void => {
		let insertMock: SpyInstance;
		const id: string = '10';
		const createOTPCodeDtoMock: CreateOTPCodeDto = plainToInstance(CreateOTPCodeDto, <
			CreateOTPCodeDto
		>{
			code: 476293,
			expiresAt: '2023-11-21 18:44:00',
		});

		beforeEach((): void => {
			insertMock = jest.spyOn(otpCodesRepository, 'insert').mockResolvedValue(
				Promise.resolve(<InsertResult>{
					identifiers: <ObjectLiteral>[{ id }],
				}),
			);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(otpCodesRepository.createOTPCode).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(otpCodesRepository.createOTPCode).toBeInstanceOf(Function);
		});

		it('should use insert method for creating new OTP code', async (): Promise<void> => {
			await otpCodesRepository.createOTPCode(createOTPCodeDtoMock);

			expect(insertMock).toHaveBeenCalledTimes(1);
			expect(insertMock).toHaveBeenCalledWith(createOTPCodeDtoMock);
		});

		it('should return id of created OTP code', async (): Promise<void> => {
			const result: string = await otpCodesRepository.createOTPCode(createOTPCodeDtoMock);

			expect(result).toEqual(id);
		});
	});
});
