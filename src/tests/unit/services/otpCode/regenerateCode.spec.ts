import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { OTPCodesService } from '@services';

import { providers } from '@modules/providers';

import { IOTPCodesRepository } from '@repositories';

import { CustomProviders } from '@enums';

import { OTPCode } from '@entities';

import { otpCodes } from '@testMocks';

import { OTPCodesHelper, DateHelper } from '@helpers';

import { otpCodeConfig } from '@configs';

describe('OTP codes service', (): void => {
	let otpCodesService: OTPCodesService;
	let otpCodesRepository: IOTPCodesRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				OTPCodesService,

				providers.CTF_OTP_CODES_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		otpCodesService = moduleFixture.get(OTPCodesService);
		otpCodesRepository = moduleFixture.get(CustomProviders.CTF_OTP_CODES_REPOSITORY);
	});

	describe('Regenerate code', (): void => {
		const otpCodeMock: OTPCode = otpCodes[5];
		const otpCode: number = otpCodeMock.code as number;
		const otpCodeExpirationDate: string = otpCodeMock.expiresAt as string;

		const id: string = otpCodeMock.id;

		beforeEach((): void => {
			jest.spyOn(OTPCodesHelper, 'generateOTPCode').mockReturnValue(otpCode);
			jest.spyOn(DateHelper, 'dateTimeFuture').mockReturnValue(otpCodeExpirationDate);

			jest.spyOn(otpCodesRepository, 'update').mockResolvedValue(otpCodeMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call generate otp code method from otp codes helper to generate new code', async (): Promise<void> => {
			await otpCodesService.regenerateCode(id);

			expect(OTPCodesHelper.generateOTPCode).toHaveBeenCalledTimes(1);
		});

		it('should call date time future method from date helper to generate new expiration date for otp code', async (): Promise<void> => {
			await otpCodesService.regenerateCode(id);

			expect(DateHelper.dateTimeFuture).toHaveBeenCalledTimes(1);
			expect(DateHelper.dateTimeFuture).toHaveBeenNthCalledWith(1, otpCodeConfig.ttl);
		});

		it('should call update method from otp codes repository to update user otp code', async (): Promise<void> => {
			await otpCodesService.regenerateCode(id);

			expect(otpCodesRepository.update).toHaveBeenCalledTimes(1);
			expect(otpCodesRepository.update).toHaveBeenNthCalledWith(
				1,
				id,
				otpCode,
				otpCodeExpirationDate,
			);
		});

		it('should return new otp code if it was successfully updated', async (): Promise<void> => {
			const updatedOtpCode: number | null = await otpCodesService.regenerateCode(id);

			expect(updatedOtpCode).toBe(otpCode);
		});

		it('should return null if otp code was not updated', async (): Promise<void> => {
			jest.spyOn(otpCodesRepository, 'update').mockResolvedValue({ ...otpCodeMock, code: null });

			const updatedOtpCode: number | null = await otpCodesService.regenerateCode(id);

			expect(updatedOtpCode).toBeNull();
		});
	});
});
