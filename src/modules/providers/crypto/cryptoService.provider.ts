import { CustomProviders } from '@Enums/CustomProviders.enum';
import { CryptoService } from '@Services/crypto.service';
import { ClassProvider } from '@nestjs/common';

export const cryptoServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_CRYPTO_SERVICE,
	useClass: CryptoService,
};
