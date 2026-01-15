import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { CryptoService } from '@services';

export const cryptoServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_CRYPTO_SERVICE,
	useClass: CryptoService,
};
