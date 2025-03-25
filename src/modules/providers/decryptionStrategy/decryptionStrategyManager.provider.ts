import { ClassProvider } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { DecryptionStrategyManager } from '@services/crypto/decryptionStrategy/DecryptionStrategyManager';

export const decryptionStrategyManagerProvider: ClassProvider = {
	provide: CustomProviders.CTF_DECRYPTION_STRATEGY_MANAGER,
	useClass: DecryptionStrategyManager,
};
