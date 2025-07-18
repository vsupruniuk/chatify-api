import * as crypto from 'crypto';
import { PasswordResetTokensHelper } from '@helpers/passwordResetTokens.helper';

describe('Password reset token', (): void => {
	describe('Generate token', (): void => {
		const uuidMock: `${string}-${string}-${string}-${string}-${string}` =
			'd7120f56-a8b5-4bcf-9327-db0edd80d5f1';

		beforeEach((): void => {
			jest.spyOn(crypto, 'randomUUID').mockReturnValue(uuidMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(PasswordResetTokensHelper.generateToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(PasswordResetTokensHelper.generateToken).toBeInstanceOf(Function);
		});

		it('should use random uuid method from crypto package to generate random uuid', (): void => {
			PasswordResetTokensHelper.generateToken();

			expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
		});

		it('should return generated token', (): void => {
			const token: string = PasswordResetTokensHelper.generateToken();

			expect(token).toBe(uuidMock);
		});
	});
});
