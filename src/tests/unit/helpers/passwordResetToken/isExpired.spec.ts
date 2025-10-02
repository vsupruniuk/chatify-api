import { plainToInstance } from 'class-transformer';

import { DateHelper, PasswordResetTokensHelper } from '@helpers';

import { PasswordResetToken } from '@entities';

import { passwordResetTokens } from '@testMocks';

import { PasswordResetTokenDto } from '@dtos/passwordResetToken';

describe('Password reset tokens helper', (): void => {
	describe('Is expired', (): void => {
		const passwordResetTokenMock: PasswordResetToken = passwordResetTokens[1];

		const passwordResetToken: PasswordResetTokenDto = plainToInstance(
			PasswordResetTokenDto,
			passwordResetTokenMock,
			{
				excludeExtraneousValues: true,
			},
		);

		beforeEach((): void => {
			jest.spyOn(DateHelper, 'isDateLessThanCurrent').mockReturnValue(true);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call is date less than current method from date helper to check if token is not expired', (): void => {
			PasswordResetTokensHelper.isExpired(passwordResetToken);

			expect(DateHelper.isDateLessThanCurrent).toHaveBeenCalledTimes(1);
			expect(DateHelper.isDateLessThanCurrent).toHaveBeenNthCalledWith(
				1,
				passwordResetToken.expiresAt,
			);
		});

		it('should return true if expires at is null', (): void => {
			const isExpired: boolean = PasswordResetTokensHelper.isExpired({
				...passwordResetToken,
				expiresAt: null,
			});

			expect(isExpired).toBe(true);
		});

		it('should return true if expires at is less than current date', (): void => {
			const isExpired: boolean = PasswordResetTokensHelper.isExpired(passwordResetToken);

			expect(isExpired).toBe(true);
		});

		it('should return false if expires at is greater than current date or the same', (): void => {
			jest.spyOn(DateHelper, 'isDateLessThanCurrent').mockReturnValue(false);

			const isExpired: boolean = PasswordResetTokensHelper.isExpired(passwordResetToken);

			expect(isExpired).toBe(false);
		});
	});
});
