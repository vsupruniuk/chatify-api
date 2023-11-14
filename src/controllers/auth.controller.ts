import { Body, Controller, Inject, Post } from '@nestjs/common';
import { UsersService } from '@Services/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly _usersService: UsersService,

		@Inject(CACHE_MANAGER)
		private readonly _cacheManager: Cache,
	) {}

	@Post('/signup')
	test(@Body() signupUserDto: SignupUserDto) {
		const user: CreateUserDto = {
			accountSettingsId: 'no',
			statusId: 'no',
			email: 'test@email.com',
			firstName: 'Vlad',
			nickname: 'nickname',
			password: 'password',
		};

		return this._usersService.test(user);
	}
}
