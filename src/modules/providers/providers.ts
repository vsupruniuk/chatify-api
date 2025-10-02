import { Provider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import {
	accountSettingsRepositoryProvider,
	accountSettingsServiceProvider,
} from '@modules/providers/accountSettings';
import { authServiceProvider } from '@modules/providers/auth';
import { cryptoServiceProvider } from '@modules/providers/crypto';
import {
	directChatsRepositoryProvider,
	directChatsServiceProvider,
} from '@modules/providers/directChats';
import { directChatMessagesProvider } from '@modules/providers/directChatMessages';
import { emailServiceProvider } from '@modules/providers/email';
import { throttlerGuardProvider } from '@modules/providers/guards';
import {
	jwtTokensRepositoryProvider,
	jwtTokensServiceProvider,
} from '@modules/providers/jwtTokens';
import { otpCodesRepositoryProvider, otpCodesServiceProvider } from '@modules/providers/otpCodes';
import {
	passwordResetTokensRepositoryProvider,
	passwordResetTokensServiceProvider,
} from '@modules/providers/passwordResetTokens';
import { appUserServiceProvider } from '@modules/providers/appUser';
import { usersRepositoryProvider, usersServiceProvider } from '@modules/providers/users';
import { wsClientsServiceProvider } from '@modules/providers/wsClients';
import { decryptionStrategyManagerProvider } from '@modules/providers/decryptionStrategy';

export const providers: Record<CustomProviders, Provider> = {
	[CustomProviders.CTF_ACCOUNT_SETTINGS_SERVICE]: accountSettingsServiceProvider,
	[CustomProviders.CTF_ACCOUNT_SETTINGS_REPOSITORY]: accountSettingsRepositoryProvider,

	[CustomProviders.CTF_AUTH_SERVICE]: authServiceProvider,

	[CustomProviders.CTF_CRYPTO_SERVICE]: cryptoServiceProvider,

	[CustomProviders.CTF_DIRECT_CHATS_SERVICE]: directChatsServiceProvider,
	[CustomProviders.CTF_DIRECT_CHATS_REPOSITORY]: directChatsRepositoryProvider,

	[CustomProviders.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY]: directChatMessagesProvider,

	[CustomProviders.CTF_EMAIL_SERVICE]: emailServiceProvider,

	[CustomProviders.CTF_THROTTLER_GUARD]: throttlerGuardProvider,

	[CustomProviders.CTF_JWT_TOKENS_SERVICE]: jwtTokensServiceProvider,
	[CustomProviders.CTF_JWT_TOKENS_REPOSITORY]: jwtTokensRepositoryProvider,

	[CustomProviders.CTF_OTP_CODES_SERVICE]: otpCodesServiceProvider,
	[CustomProviders.CTF_OTP_CODES_REPOSITORY]: otpCodesRepositoryProvider,

	[CustomProviders.CTF_PASSWORD_RESET_TOKENS_SERVICE]: passwordResetTokensServiceProvider,
	[CustomProviders.CTF_PASSWORD_RESET_TOKENS_REPOSITORY]: passwordResetTokensRepositoryProvider,

	[CustomProviders.CTF_APP_USER_SERVICE]: appUserServiceProvider,
	[CustomProviders.CTF_USERS_SERVICE]: usersServiceProvider,
	[CustomProviders.CTF_USERS_REPOSITORY]: usersRepositoryProvider,

	[CustomProviders.CTF_WS_CLIENTS_SERVICE]: wsClientsServiceProvider,

	[CustomProviders.CTF_DECRYPTION_STRATEGY_MANAGER]: decryptionStrategyManagerProvider,
};
