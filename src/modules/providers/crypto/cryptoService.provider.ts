import { CustomProviders } from '@Enums/CustomProviders.enum';
import { CryptoService } from '@Services/crypto.service';

export const cryptoServiceProvider = {
	provide: CustomProviders.I_CRYPTO_SERVICE_PROVIDER,
	useClass: CryptoService,
};
