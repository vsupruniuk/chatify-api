import { CustomProviders } from '@enums/CustomProviders.enum';
import { AuthService } from '@services/auth/auth.service';
import { ClassProvider } from '@nestjs/common';

export const authServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_AUTH_SERVICE,
	useClass: AuthService,
};
