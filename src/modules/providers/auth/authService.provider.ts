import { CustomProviders } from '@Enums/CustomProviders.enum';
import { AuthService } from '@Services/auth.service';

export const authServiceProvider = {
	provide: CustomProviders.I_AUTH_SERVICE,
	useClass: AuthService,
};
