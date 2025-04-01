import { CustomProviders } from '@enums/CustomProviders.enum';
import { CryptoService } from '@services/crypto/crypto.service';
import { ClassProvider } from '@nestjs/common';

export const cryptoServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_CRYPTO_SERVICE,
	useClass: CryptoService,
};
