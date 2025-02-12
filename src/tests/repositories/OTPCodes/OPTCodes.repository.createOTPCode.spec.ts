import { DataSource, InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { plainToInstance } from 'class-transformer';
import { OTPCodesRepository } from '@repositories/OTPCodes.repository';
import { CreateOTPCodeDto } from '../../../types/dto/OTPCodes/CreateOTPCode.dto';
import { OTPCode } from '@entities/OTPCode.entity';

describe.skip('OTPCodesRepository', (): void => {
	let otpCodesRepository: OTPCodesRepository;

	const insertMock: jest.Mock = jest.fn().mockReturnThis();
	const intoMock: jest.Mock = jest.fn().mockReturnThis();
	const valuesMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<InsertResult> => {
		return <InsertResult>{
			identifiers: <ObjectLiteral>[{ id: '10' }],
		};
	});

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				insert: insertMock,
				into: intoMock,
				values: valuesMock,
				execute: executeMock,
			};
		}),
	};

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(dataSourceMock);
	});

	describe('createOTPCode', (): void => {
		const id: string = '10';
		const createOTPCodeDtoMock: CreateOTPCodeDto = plainToInstance(CreateOTPCodeDto, <
			CreateOTPCodeDto
		>{
			code: 476293,
			expiresAt: '2023-11-21 18:44:00',
		});

		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(otpCodesRepository.createOTPCode).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(otpCodesRepository.createOTPCode).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query for creating OTP code', async (): Promise<void> => {
			await otpCodesRepository.createOTPCode(createOTPCodeDtoMock);

			expect(insertMock).toHaveBeenCalledTimes(1);
			expect(intoMock).toHaveBeenCalledTimes(1);
			expect(intoMock).toHaveBeenCalledWith(OTPCode);
			expect(valuesMock).toHaveBeenCalledTimes(1);
			expect(valuesMock).toHaveBeenCalledWith(createOTPCodeDtoMock);
			expect(executeMock).toHaveBeenCalledTimes(1);
		});

		it('should return id of created OTP code', async (): Promise<void> => {
			const result: string = await otpCodesRepository.createOTPCode(createOTPCodeDtoMock);

			expect(result).toEqual(id);
		});
	});
});
