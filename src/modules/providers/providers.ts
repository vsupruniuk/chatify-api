import { Provider } from '@nestjs/common';

import { CustomProvider } from '@enums';

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
import {
	directChatMessagesRepositoryProvider,
	directChatMessagesServiceProvider,
} from '@modules/providers/directChatMessages';
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

export const providers: Record<CustomProvider, Provider> = {
	[CustomProvider.CTF_ACCOUNT_SETTINGS_SERVICE]: accountSettingsServiceProvider,
	[CustomProvider.CTF_ACCOUNT_SETTINGS_REPOSITORY]: accountSettingsRepositoryProvider,

	[CustomProvider.CTF_AUTH_SERVICE]: authServiceProvider,

	[CustomProvider.CTF_CRYPTO_SERVICE]: cryptoServiceProvider,
	[CustomProvider.CTF_DECRYPTION_STRATEGY_MANAGER]: decryptionStrategyManagerProvider,

	[CustomProvider.CTF_DIRECT_CHATS_SERVICE]: directChatsServiceProvider,
	[CustomProvider.CTF_DIRECT_CHATS_REPOSITORY]: directChatsRepositoryProvider,

	[CustomProvider.CTF_DIRECT_CHAT_MESSAGES_SERVICE]: directChatMessagesServiceProvider,
	[CustomProvider.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY]: directChatMessagesRepositoryProvider,

	[CustomProvider.CTF_EMAIL_SERVICE]: emailServiceProvider,

	[CustomProvider.CTF_THROTTLER_GUARD]: throttlerGuardProvider,

	[CustomProvider.CTF_JWT_TOKENS_SERVICE]: jwtTokensServiceProvider,
	[CustomProvider.CTF_JWT_TOKENS_REPOSITORY]: jwtTokensRepositoryProvider,

	[CustomProvider.CTF_OTP_CODES_SERVICE]: otpCodesServiceProvider,
	[CustomProvider.CTF_OTP_CODES_REPOSITORY]: otpCodesRepositoryProvider,

	[CustomProvider.CTF_PASSWORD_RESET_TOKENS_SERVICE]: passwordResetTokensServiceProvider,
	[CustomProvider.CTF_PASSWORD_RESET_TOKENS_REPOSITORY]: passwordResetTokensRepositoryProvider,

	[CustomProvider.CTF_APP_USER_SERVICE]: appUserServiceProvider,

	[CustomProvider.CTF_USERS_SERVICE]: usersServiceProvider,
	[CustomProvider.CTF_USERS_REPOSITORY]: usersRepositoryProvider,

	[CustomProvider.CTF_WS_CLIENTS_SERVICE]: wsClientsServiceProvider,
};
