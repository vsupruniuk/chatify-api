import { IPasswordResetTokensService } from '@services/passwordResetToken/IPasswordResetTokensService';
import { Inject } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IPasswordResetTokensRepository } from '@repositories/passwordResetToken/IPasswordResetTokensRepository';
import { PasswordResetTokensHelper } from '@helpers/passwordResetTokens.helper';
import { DateHelper } from '@helpers/date.helper';
import { passwordResetTokenConfig } from '@configs/passwordResetToken.config';
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';

export class PasswordResetTokensService implements IPasswordResetTokensService {
	constructor(
		@Inject(CustomProviders.CTF_PASSWORD_RESET_TOKENS_REPOSITORY)
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
