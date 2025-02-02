import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Provider } from '@nestjs/common';
import {
	accountSettingsRepositoryProvider,
	accountSettingsServiceProvider,
	passwordResetTokensServiceProvider,
	directChatsServiceProvider,
	directChatsRepositoryProvider,
	authServiceProvider,
	cryptoServiceProvider,
	emailServiceProvider,
	passwordResetTokensRepositoryProvider,
	jwtTokensRepositoryProvider,
	jwtTokensServiceProvider,
	usersServiceProvider,
	usersRepositoryProvider,
	throttlerGuardProvider,
	otpCodesServiceProvider,
	otpCodesRepositoryProvider,
} from '@Modules/providers';

const providers: Record<CustomProviders, Provider> = {
	[CustomProviders.CTF_ACCOUNT_SETTINGS_SERVICE]: accountSettingsServiceProvider,
	[CustomProviders.CTF_ACCOUNT_SETTINGS_REPOSITORY]: accountSettingsRepositoryProvider,

	[CustomProviders.CTF_AUTH_SERVICE]: authServiceProvider,

	[CustomProviders.CTF_CRYPTO_SERVICE]: cryptoServiceProvider,

	[CustomProviders.CTF_DIRECT_CHATS_SERVICE]: directChatsServiceProvider,
	[CustomProviders.CTF_DIRECT_CHATS_REPOSITORY]: directChatsRepositoryProvider,

	[CustomProviders.CTF_EMAIL_SERVICE]: emailServiceProvider,

	[CustomProviders.CTF_THROTTLER_GUARD]: throttlerGuardProvider,

	[CustomProviders.CTF_JWT_TOKENS_SERVICE]: jwtTokensServiceProvider,
	[CustomProviders.CTF_JWT_TOKENS_REPOSITORY]: jwtTokensRepositoryProvider,

	[CustomProviders.CTF_OTP_CODES_SERVICE]: otpCodesServiceProvider,
	[CustomProviders.CTF_OTP_CODES_REPOSITORY]: otpCodesRepositoryProvider,

	[CustomProviders.CTF_PASSWORD_RESET_TOKENS_SERVICE]: passwordResetTokensServiceProvider,
	[CustomProviders.CTF_PASSWORD_RESET_TOKENS_REPOSITORY]: passwordResetTokensRepositoryProvider,

	[CustomProviders.CTF_USERS_SERVICE]: usersServiceProvider,
	[CustomProviders.CTF_USERS_REPOSITORY]: usersRepositoryProvider,
};

export default providers;
