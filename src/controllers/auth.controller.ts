import {
	Body,
	ConflictException,
	Controller,
	HttpCode,
	HttpStatus,
	Inject,
	Post,
} from '@nestjs/common';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { IEmailService } from '@Interfaces/emails/IEmailService';
import { IAuthController } from '@Interfaces/users/IAuthController';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';

@Controller('auth')
export class AuthController implements IAuthController {
	constructor(
		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.I_EMAIL_SERVICE)
		private readonly _emailService: IEmailService,
	) {}

	@Post('/signup')
	@HttpCode(HttpStatus.CREATED)
	async signup(@Body() signupUserDTO: SignupUserDto): Promise<UserShortDto> {
		const userByEmail: UserShortDto | null = await this._usersService.getByEmail(
			signupUserDTO.email,
		);

		if (userByEmail) {
			throw new ConflictException('This email is already taken');
		}

		const userByNickname: UserShortDto | null = await this._usersService.getByNickname(
			signupUserDTO.nickname,
		);

		if (userByNickname) {
			throw new ConflictException('This nickname is already taken');
		}

		const createdUser: UserShortDto = await this._usersService.createUser(signupUserDTO);
		const userOTPCode: OTPCodeResponseDto = await this._usersService.getUserOTPCode(
			createdUser.OTPCodeId,
		);

		await this._emailService.sendActivationEmail(createdUser.email, userOTPCode.code);

		return createdUser;
	}
}
