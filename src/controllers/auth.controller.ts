import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';

import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { IAuthController } from '@Interfaces/auth/IAuthController';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { IEmailService } from '@Interfaces/emails/IEmailService';

import { IUsersService } from '@Interfaces/users/IUsersService';
import {
	Body,
	ConflictException,
	Controller,
	HttpCode,
	HttpStatus,
	Inject,
	Post,
} from '@nestjs/common';

import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';

@Controller('auth')
export class AuthController implements IAuthController {
	constructor(
		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.I_AUTH_SERVICE)
		private readonly _authService: IAuthService,

		@Inject(CustomProviders.I_EMAIL_SERVICE)
		private readonly _emailService: IEmailService,
	) {}

	@Post('/signup')
	@HttpCode(HttpStatus.CREATED)
	public async signup(@Body() signupUserDTO: SignupUserDto): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<UserShortDto> = new SuccessfulResponseResult(
			HttpStatus.CREATED,
			ResponseStatus.SUCCESS,
		);

		const userByEmail: UserShortDto | null = await this._usersService.getByEmail(
			signupUserDTO.email,
		);

		if (userByEmail) {
			throw new ConflictException(['This email is already taken|email']);
		}

		const userByNickname: UserShortDto | null = await this._usersService.getByNickname(
			signupUserDTO.nickname,
		);

		if (userByNickname) {
			throw new ConflictException(['This nickname is already taken|nickname']);
		}

		const createdUser: UserShortDto = await this._usersService.createUser(signupUserDTO);
		const userOTPCode: OTPCodeResponseDto = await this._usersService.getUserOTPCode(
			createdUser.OTPCodeId,
		);

		await this._emailService.sendActivationEmail(createdUser.email, userOTPCode.code);

		responseResult.data = [createdUser];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Post('/activate-account')
	@HttpCode(HttpStatus.OK)
	public async activateAccount(
		@Body() accountActivationDto: AccountActivationDto,
	): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<object> = new SuccessfulResponseResult<object>(
			200,
			ResponseStatus.SUCCESS,
		);

		await this._authService.activateAccount(accountActivationDto);

		return responseResult;

		// Workflow
		// 1. Get codeId and code from body and validate them
		// 2. Call activation method in service
		// 3. Get otp code from db via repository
		// 4. Validate expiration in service
		// 5. If expire return false
		// 6. If not expire update activated status via repository
		// 7. Return true
	}
}
