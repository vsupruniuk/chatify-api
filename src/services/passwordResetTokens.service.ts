import { IPasswordResetTokensService } from '@interfaces/passwordResetTokens/IPasswordResetTokens.service';

export class PasswordResetTokensService implements IPasswordResetTokensService {
	constructor() // private readonly _passwordResetTokensRepository: IPasswordResetTokensRepository, // @Inject(CustomProviders.CTF_PASSWORD_RESET_TOKENS_REPOSITORY)
	//
	// @Inject(CustomProviders.CTF_USERS_REPOSITORY)
	// private readonly _usersRepository: IUsersRepository,
	{}

	// // TODO check if needed
	// public async saveToken(
	// 	userId: string,
	// 	userResetPasswordTokenId: string | null,
	// ): Promise<string | null> {
	// 	let newTokenId: string = userResetPasswordTokenId || '';
	// 	let createdToken: PasswordResetToken | null;
	//
	// 	const newToken: PasswordResetTokenInfoDto = PasswordResetTokensHelper.generateToken();
	//
	// 	if (userResetPasswordTokenId) {
	// 		const isUpdated: boolean = await this._passwordResetTokensRepository.updateToken(
	// 			userResetPasswordTokenId,
	// 			newToken,
	// 		);
	//
	// 		if (!isUpdated) {
	// 			return null;
	// 		}
	//
	// 		createdToken = await this._passwordResetTokensRepository.getByField('id', newTokenId);
	// 	} else {
	// 		newTokenId = await this._passwordResetTokensRepository.createToken(newToken);
	//
	// 		createdToken = await this._passwordResetTokensRepository.getByField('id', newTokenId);
	//
	// 		await this._usersRepository.updateUser(userId, {
	// 			passwordResetToken: createdToken,
	// 		});
	// 	}
	//
	// 	return createdToken ? createdToken.token : null;
	// }
	//
	// // TODO check if needed
	// public async deleteToken(tokenId: string): Promise<boolean> {
	// 	return this._passwordResetTokensRepository.deleteToken(tokenId);
	// }
}
