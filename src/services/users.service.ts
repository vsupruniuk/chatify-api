import { CreateOTPCodeDto } from '@DTO/OTPCodes/CreateOTPCode.dto';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';

import { DateHelper } from '@Helpers/date.helper';
import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';

import { IUsersService } from '@Interfaces/users/IUsersService';
import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { plainToInstance } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService implements IUsersService {
	constructor(
		@Inject(CustomProviders.I_ACCOUNT_SETTINGS_REPOSITORY)
		private readonly _accountSettingsRepository: IAccountSettingsRepository,

		@Inject(CustomProviders.I_OTP_CODES_REPOSITORY)
		private readonly _otpCodesRepository: IOTPCodesRepository,

		@Inject(CustomProviders.I_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,
	) {}

	public async getFullUserByEmail(email: string): Promise<UserFullDto | null> {
		return await this._usersRepository.getFullUserByEmail(email);
	}

	public async getByEmail(email: string): Promise<UserShortDto | null> {
		return await this._usersRepository.getByEmail(email);
	}

	public async getByNickname(nickname: string): Promise<UserShortDto | null> {
		return await this._usersRepository.getByNickname(nickname);
	}

	public async getByResetPasswordToken(token: string): Promise<UserFullDto | null> {
		return await this._usersRepository.getByResetPasswordToken(token);
	}

	public async createUser(signupUserDto: SignupUserDto): Promise<UserShortDto | null> {
		const otpCodeDTO: CreateOTPCodeDto = plainToInstance(CreateOTPCodeDto, <CreateOTPCodeDto>{
			code: OTPCodesHelper.generateOTPCode(),
			expiresAt: DateHelper.dateTimeFuture(1000 * 60 * 10),
		});

		const accountSettingsId: string = await this._accountSettingsRepository.createDefaultSettings();
		const otpCodeId: string = await this._otpCodesRepository.createOTPCode(otpCodeDTO);
		const hashedPassword: string = await bcrypt.hash(
			signupUserDto.password,
			Number(process.env.PASSWORD_SALT_HASH_ROUNDS) || 10,
		);

		const userForCreation: CreateUserDto = plainToInstance(CreateUserDto, <CreateUserDto>{
			...signupUserDto,
			accountSettingsId,
			OTPCodeId: otpCodeId,
			password: hashedPassword,
		});

		const createdUserId: string = await this._usersRepository.createUser(userForCreation);
		return await this._usersRepository.getById(createdUserId);
	}

	public async createPasswordResetToken(userId: string): Promise<string | null> {
		const passwordResetToken: string = uuidv4();

		const isUpdated: boolean = await this._usersRepository.updateUser(userId, {
			passwordResetToken,
		});

		return isUpdated ? passwordResetToken : null;
	}

	public async updateUser(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<boolean> {
		const updateUserDtoCopy: Partial<UpdateUserDto> = { ...updateUserDto };

		if (updateUserDtoCopy.password) {
			updateUserDtoCopy.password = await bcrypt.hash(
				updateUserDtoCopy.password,
				Number(process.env.PASSWORD_SALT_HASH_ROUNDS) || 10,
			);
		}

		return await this._usersRepository.updateUser(userId, updateUserDtoCopy);
	}
}
