import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { CryptoService } from '@services';

export const cryptoServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_CRYPTO_SERVICE,
	useClass: CryptoService,
};
