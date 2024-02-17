import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { PasswordResetTokensHelper } from '@Helpers/passwordResetTokens.helper';
import { IPasswordResetTokensService } from '@Interfaces/passwordResetTokens/IPasswordResetTokens.service';
import { IPasswordResetTokensRepository } from '@Interfaces/passwordResetTokens/IPasswordResetTokensRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { Inject } from '@nestjs/common';

export class PasswordResetTokensService implements IPasswordResetTokensService {
	constructor(
		@Inject(CustomProviders.I_PASSWORD_RESET_TOKENS_REPOSITORY)
		private readonly _passwordResetTokensRepository: IPasswordResetTokensRepository,

		@Inject(CustomProviders.I_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,
	) {}

	public async saveToken(
		userId: string,
		userResetPasswordTokenId: string | null,
	): Promise<string | null> {
		let newTokenId: string = userResetPasswordTokenId || '';

		const newToken: Omit<PasswordResetTokenDto, 'id'> = PasswordResetTokensHelper.generateToken();

		if (userResetPasswordTokenId) {
			const isUpdated: boolean = await this._passwordResetTokensRepository.updateToken(
				userResetPasswordTokenId,
				newToken,
			);

			if (!isUpdated) {
				return null;
			}
		} else {
			newTokenId = await this._passwordResetTokensRepository.createToken(newToken);

			await this._usersRepository.updateUser(userId, {
				passwordResetTokenId: newTokenId,
			});
		}

		const createdToken: PasswordResetTokenDto | null =
			await this._passwordResetTokensRepository.getByField('id', newTokenId);

		return createdToken ? createdToken.token : newTokenId;
	}
}
