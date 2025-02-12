import SpyInstance = jest.SpyInstance;
import { randomUUID } from 'node:crypto';
import * as dayjs from 'dayjs';
import { DateHelper } from '@helpers/date.helper';
import { PasswordResetTokensHelper } from '@helpers/passwordResetTokens.helper';
import { PasswordResetTokenInfoDto } from '../../../types/dto/passwordResetTokens/passwordResetTokenInfo.dto';

jest.mock('node:crypto', () => {
	return {
		randomUUID: jest.fn().mockReturnValue('uuid-v4'),
	};
});

describe.skip('passwordResetTokensHelper', (): void => {
	describe('generateToken', (): void => {
		const dateTimeMock: string = '2024-02-12 18:00:00';
		let dateTimeFutureMock: SpyInstance;

		beforeEach((): void => {
			dateTimeFutureMock = jest
				.spyOn(DateHelper, 'dateTimeFuture')
				.mockReturnValue(dayjs(dateTimeMock).toISOString());

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

		it('should call randomUUID method from node:crypto to generate token', (): void => {
			PasswordResetTokensHelper.generateToken();

			expect(randomUUID).toHaveBeenCalledTimes(1);
		});

		it('should call dateTimeFuture method in DateHelper to generate token expiration date', (): void => {
			PasswordResetTokensHelper.generateToken();

			expect(dateTimeFutureMock).toHaveBeenCalledTimes(1);
			expect(dateTimeFutureMock).toHaveBeenCalledWith(1000 * 60 * 60 * 24);
		});

		it('should return correct result', (): void => {
			const token: PasswordResetTokenInfoDto = PasswordResetTokensHelper.generateToken();

			expect(token.token).toBe('uuid-v4');
			expect(token.expiresAt).toBe(dayjs(dateTimeMock).toISOString());
		});
	});
});
