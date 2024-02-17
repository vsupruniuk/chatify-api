import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { PasswordResetTokensHelper } from '@Helpers/passwordResetTokens.helper';

describe('passwordResetTokensHelper', (): void => {
	describe('isExpired', (): void => {
		const timeMock: string = '2024-02-12 18:00:00';

		beforeEach((): void => {
			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
		});

		it('should be declared', (): void => {
			expect(PasswordResetTokensHelper.isExpired).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(PasswordResetTokensHelper.isExpired).toBeInstanceOf(Function);
		});

		it('should return false if token expiresAt property greater then current date', (): void => {
			jest.setSystemTime(new Date(timeMock));

			const token: PasswordResetTokenDto = {
				id: '1',
				token: 'token',
				expiresAt: '2024-02-12 18:10:00',
			};

			const isExpired: boolean = PasswordResetTokensHelper.isExpired(token);

			expect(isExpired).toBe(false);
		});

		it('should return false if token expiresAt property equal to current date', (): void => {
			jest.setSystemTime(new Date(timeMock));

			const token: PasswordResetTokenDto = {
				id: '1',
				token: 'token',
				expiresAt: '2024-02-12 18:00:00',
			};

			const isExpired: boolean = PasswordResetTokensHelper.isExpired(token);

			expect(isExpired).toBe(false);
		});

		it('should return true if code expiresAt property less then current date', (): void => {
			jest.setSystemTime(new Date(timeMock));

			const token: PasswordResetTokenDto = {
				id: '1',
				token: 'token',
				expiresAt: '2024-02-12 17:55:00',
			};

			const isExpired: boolean = PasswordResetTokensHelper.isExpired(token);

			expect(isExpired).toBe(true);
		});
	});
});
