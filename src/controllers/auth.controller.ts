import { Body, Controller, Inject, Post } from '@nestjs/common';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { IEmailService } from '@Interfaces/emails/IEmailService';

@Controller('auth')
export class AuthController {
	constructor(
		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.I_EMAIL_SERVICE)
		private readonly _emailService: IEmailService,
	) {}

	@Post('/signup')
	async test(@Body() signupUserDTO: SignupUserDto) {
		return this._usersService.createUser(signupUserDTO);
	}
}
