import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { DecryptionStrategyManager } from '@services/crypto/decryptionStrategy';

export const decryptionStrategyManagerProvider: ClassProvider = {
	provide: CustomProvider.CTF_DECRYPTION_STRATEGY_MANAGER,
	useClass: DecryptionStrategyManager,
};
