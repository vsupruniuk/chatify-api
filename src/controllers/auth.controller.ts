import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { ResendActivationCodeDto } from '@DTO/auth/ResendActivationCode.dto';

import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { IAuthController } from '@Interfaces/auth/IAuthController';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { IEmailService } from '@Interfaces/emails/IEmailService';
import { IOTPCodesService } from '@Interfaces/OTPCodes/IOTPCodesService';

import { IUsersService } from '@Interfaces/users/IUsersService';
import {
	Body,
	ConflictException,
	Controller,
	HttpCode,
	HttpStatus,
	Inject,
	NotFoundException,
	Post,
	UnprocessableEntityException,
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

		@Inject(CustomProviders.I_OTP_CODES_SERVICE)
		private readonly _otpCodesService: IOTPCodesService,
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

		const createdUser: UserShortDto | null = await this._usersService.createUser(signupUserDTO);

		if (!createdUser) {
			throw new UnprocessableEntityException(['Failed to create user. Please try again|email']);
		}

		const userOTPCode: OTPCodeResponseDto | null = await this._usersService.getUserOTPCode(
			createdUser.OTPCodeId,
		);

		if (!userOTPCode || !userOTPCode.code) {
			throw new UnprocessableEntityException(['Failed to create user. Please try again|email']);
		}

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
		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.OK,
			ResponseStatus.SUCCESS,
		);

		const isActivated: boolean = await this._authService.activateAccount(accountActivationDto);

		if (!isActivated) {
			throw new UnprocessableEntityException([
				'Invalid or expired code. Please check the entered code or request a new one|otpCode',
			]);
		}

		await this._otpCodesService.updateOTPCode(accountActivationDto.OTPCodeId, {
			code: null,
			expiresAt: null,
		});

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Post('/resend-activation-code')
	@HttpCode(HttpStatus.OK)
	public async resendActivationCode(
		@Body() resendActivationCodeDto: ResendActivationCodeDto,
	): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.OK,
			ResponseStatus.SUCCESS,
		);

		const user: UserFullDto | null = await this._usersService.getFullUserByEmail(
			resendActivationCodeDto.email,
		);

		if (!user) {
			throw new NotFoundException(['User with this email does not exist|email']);
		}

		if (user.isActivated) {
			throw new UnprocessableEntityException(['This account is already activated|email']);
		}

		await this._otpCodesService.createNewOTPCode(user.OTPCodeId);

		const otpCode: OTPCodeResponseDto | null = await this._usersService.getUserOTPCode(
			user.OTPCodeId,
		);

		if (!otpCode || !otpCode.code) {
			throw new UnprocessableEntityException([
				'Failed to create new OTP code. Please try again|email',
			]);
		}

		await this._emailService.sendActivationEmail(resendActivationCodeDto.email, otpCode.code);

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}
}
