import { AuthGuard } from '@Guards/auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('app-user')
@UseGuards(AuthGuard)
export class AppUserController {
	@Get('/get-user')
	getUser() {
		return 'Current user';
	}
}
