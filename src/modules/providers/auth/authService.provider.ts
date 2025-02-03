import { CustomProviders } from '@Enums/CustomProviders.enum';
import { AuthService } from '@Services/auth.service';
import { ClassProvider } from '@nestjs/common';

export const authServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_AUTH_SERVICE,
	useClass: AuthService,
};
