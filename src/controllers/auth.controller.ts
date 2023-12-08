import {
	Body,
	ConflictException,
	Controller,
	HttpCode,
	HttpStatus,
	Inject,
	Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiBadRequestResponseGeneric } from '@Decorators/ApiResponses/ApiBadRequestResponseGeneric.decorator';
import { ApiConflictResponseGeneric } from '@Decorators/ApiResponses/ApiConflictResponseGeneric.decorator';

import { ApiCreatedResponseGeneric } from '@Decorators/ApiResponses/ApiCreatedlResponseGeneric.decorator';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { IEmailService } from '@Interfaces/emails/IEmailService';
import { IAuthController } from '@Interfaces/users/IAuthController';

import { IUsersService } from '@Interfaces/users/IUsersService';

import { ValidationErrorField } from '@Responses/errors/ValidationErrorField';
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';

@Controller('auth')
export class AuthController implements IAuthController {
	constructor(
		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.I_EMAIL_SERVICE)
		private readonly _emailService: IEmailService,
	) {}

	@ApiTags('Auth')
	@ApiCreatedResponseGeneric({
		status: 201,
		dataType: UserShortDto,
		description: 'Successfully created user',
	})
	@ApiBadRequestResponseGeneric({
		status: 400,
		errorType: ValidationErrorField,
		description: 'Validation errors occurred',
	})
	@ApiConflictResponseGeneric({
		status: 409,
		errorType: ValidationErrorField,
		description: 'Some of the unique fields are already taken',
	})
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
}
