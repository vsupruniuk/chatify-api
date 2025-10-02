import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { DecryptionStrategyManager } from '@services/crypto/decryptionStrategy';

export const decryptionStrategyManagerProvider: ClassProvider = {
	provide: CustomProviders.CTF_DECRYPTION_STRATEGY_MANAGER,
	useClass: DecryptionStrategyManager,
};
