import { Inject } from '@nestjs/common';

import { IPasswordResetTokensService } from '@services';

import { CustomProvider } from '@enums';

import { IPasswordResetTokensRepository } from '@repositories';

import { PasswordResetTokensHelper, DateHelper } from '@helpers';

import { passwordResetTokenConfig } from '@configs';

import { PasswordResetToken } from '@entities';

export class PasswordResetTokensService implements IPasswordResetTokensService {
	constructor(
		@Inject(CustomProvider.CTF_PASSWORD_RESET_TOKENS_REPOSITORY)
		private readonly _passwordResetTokensRepository: IPasswordResetTokensRepository,
	) {}

	public async regenerateToken(id: string): Promise<string | null> {
		const token: string = PasswordResetTokensHelper.generateToken();
		const tokenExpirationDate = DateHelper.dateTimeFuture(passwordResetTokenConfig.ttl);

		const updatedToken: PasswordResetToken = await this._passwordResetTokensRepository.updateToken(
			id,
			token,
			tokenExpirationDate,
		);

		return updatedToken.token;
	}
}
