import { PasswordResetTokenInfoDto } from '@DTO/passwordResetTokens/passwordResetTokenInfo.dto';
import { DateHelper } from '@Helpers/date.helper';
import { PasswordResetTokensHelper } from '@Helpers/passwordResetTokens.helper';
import SpyInstance = jest.SpyInstance;
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => {
	return {
		v4: jest.fn().mockReturnValue('uuid-v4'),
	};
});

describe('passwordResetTokensHelper', (): void => {
	describe('generateToken', (): void => {
		const dateTimeMock: string = '2024-02-12 18:00:00';
		let dateTimeFutureMock: SpyInstance;

		beforeEach((): void => {
			dateTimeFutureMock = jest
				.spyOn(DateHelper, 'dateTimeFuture')
				.mockReturnValue(new Date(dateTimeMock).toISOString());

			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(PasswordResetTokensHelper.generateToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(PasswordResetTokensHelper.generateToken).toBeInstanceOf(Function);
		});

		it('should call uuid v4 method to generate token', (): void => {
			PasswordResetTokensHelper.generateToken();

			expect(uuidv4).toHaveBeenCalledTimes(1);
		});

		it('should call uuid dateTimeFuture method in DateHelper to generate token expiration date', (): void => {
			PasswordResetTokensHelper.generateToken();

			expect(dateTimeFutureMock).toHaveBeenCalledTimes(1);
			expect(dateTimeFutureMock).toHaveBeenCalledWith(1000 * 60 * 60 * 24);
		});

		it('should return correct result', (): void => {
			const token: PasswordResetTokenInfoDto = PasswordResetTokensHelper.generateToken();

			expect(token.token).toBe('uuid-v4');
			expect(token.expiresAt).toBe(new Date(dateTimeMock).toISOString());
		});
	});
});
