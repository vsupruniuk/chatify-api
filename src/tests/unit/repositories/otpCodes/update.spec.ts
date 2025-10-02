import { Test, TestingModule } from '@nestjs/testing';

import { DataSource, UpdateResult } from 'typeorm';

import { QueryBuilderMock, otpCodes } from '@testMocks';

import { OTPCodesRepository } from '@repositories';

import { OTPCode } from '@entities';

describe('OTP codes repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let otpCodesRepository: OTPCodesRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, OTPCodesRepository],
		}).compile();

		otpCodesRepository = moduleFixture.get(OTPCodesRepository);
	});

	describe('Update', (): void => {
		const expectedOtpCode: OTPCode = otpCodes[0];
		const expectedUpdateResult: UpdateResult = { raw: [expectedOtpCode], generatedMaps: [] };

		const idMock: string = expectedOtpCode.id;
		const codeMock: number = expectedOtpCode.code as number;
		const expiresAtMock: string = expectedOtpCode.expiresAt as string;

		beforeEach((): void => {
			queryBuilderMock.execute.mockReturnValue(expectedUpdateResult);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder and create a query for updating OPT code', async (): Promise<void> => {
			await otpCodesRepository.update(idMock, codeMock, expiresAtMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.update).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.update).toHaveBeenNthCalledWith(1, OTPCode);

			expect(queryBuilderMock.set).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.set).toHaveBeenNthCalledWith(1, {
				code: codeMock,
				expiresAt: expiresAtMock,
			});

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'id = :id', { id: idMock });

			expect(queryBuilderMock.returning).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.returning).toHaveBeenNthCalledWith(1, '*');

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(1);
		});

		it('should return updated token', async (): Promise<void> => {
			const updatedCode: OTPCode = await otpCodesRepository.update(idMock, codeMock, expiresAtMock);

			expect(updatedCode).toEqual(expectedOtpCode);
		});
	});
});
