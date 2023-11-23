import { Body, Controller, ImATeapotException, Inject, Post } from '@nestjs/common';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { IEmailService } from '@Interfaces/emails/IEmailService';
import { IAuthController } from '@Interfaces/users/IAuthController';
import { UserShortDto } from '@DTO/users/UserShort.dto';

@Controller('auth')
export class AuthController implements IAuthController {
	constructor(
		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.I_EMAIL_SERVICE)
		private readonly _emailService: IEmailService,
	) {}

	@Post('/signup')
	async signup(@Body() signupUserDTO: SignupUserDto): Promise<UserShortDto> {
		throw new ImATeapotException();
	}
}
