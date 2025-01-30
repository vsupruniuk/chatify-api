import { CustomProviders } from '@Enums/CustomProviders.enum';
import { AuthService } from '@Services/auth.service';

export const authServiceProvider = {
	provide: CustomProviders.CTF_AUTH_SERVICE,
	useClass: AuthService,
};
