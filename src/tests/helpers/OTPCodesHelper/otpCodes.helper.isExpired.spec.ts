import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';

describe('otpCodesHelper', (): void => {
	describe('isExpired', (): void => {
		const timeMock: string = '2023-12-23 17:25:00';

		beforeEach((): void => {
			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
		});

		it('should be declared', (): void => {
			expect(OTPCodesHelper.isExpired).toBeDefined();
		});

		it('should return false if code expiresAt property greater then current date', (): void => {
			jest.setSystemTime(new Date(timeMock));

			const otpCode: OTPCodeResponseDto = { code: 123456, expiresAt: '2023-12-23 17:30:00' };

			const isExpired: boolean = OTPCodesHelper.isExpired(otpCode);

			expect(isExpired).toBe(false);
		});

		it('should return false if code expiresAt property equal to current date', (): void => {
			jest.setSystemTime(new Date(timeMock));

			const otpCode: OTPCodeResponseDto = { code: 123456, expiresAt: '2023-12-23 17:25:00' };

			const isExpired: boolean = OTPCodesHelper.isExpired(otpCode);

			expect(isExpired).toBe(false);
		});

		it('should return true if code expiresAt property less then current date', (): void => {
			jest.setSystemTime(new Date(timeMock));

			const otpCode: OTPCodeResponseDto = { code: 123456, expiresAt: '2023-12-23 17:20:00' };

			const isExpired: boolean = OTPCodesHelper.isExpired(otpCode);

			expect(isExpired).toBe(true);
		});
	});
});
