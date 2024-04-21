import { AppUserDto } from '@DTO/appUser/appUser.dto';
import { CreateOTPCodeDto } from '@DTO/OTPCodes/CreateOTPCode.dto';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
import { User } from '@Entities/User.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';

import { DateHelper } from '@Helpers/date.helper';
import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IPasswordResetTokensRepository } from '@Interfaces/passwordResetTokens/IPasswordResetTokensRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';

import { IUsersService } from '@Interfaces/users/IUsersService';
import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService implements IUsersService {
	constructor(
		@Inject(CustomProviders.I_ACCOUNT_SETTINGS_REPOSITORY)
		private readonly _accountSettingsRepository: IAccountSettingsRepository,

		@Inject(CustomProviders.I_OTP_CODES_REPOSITORY)
		private readonly _otpCodesRepository: IOTPCodesRepository,

		@Inject(CustomProviders.I_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,

		@Inject(CustomProviders.I_PASSWORD_RESET_TOKENS_REPOSITORY)
		private readonly _passwordResetTokenRepository: IPasswordResetTokensRepository,
	) {}

	public async getPublicUsers(
		nickname: string,
		page?: number,
		take?: number,
	): Promise<UserPublicDto[]> {
		const { skip: skipRecords, take: takeRecords } = this._getUsersSearchPagination(page, take);

		const users: User[] = await this._usersRepository.getPublicUsers(
			nickname,
			skipRecords,
			takeRecords,
		);

		return users.map((user: User) => {
			return plainToInstance(UserPublicDto, user, { excludeExtraneousValues: true });
		});
	}

	public async getFullUserByEmail(email: string): Promise<UserFullDto | null> {
		const user: User | null = await this._usersRepository.getByField('email', email);

		return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async getFullUserById(id: string): Promise<UserFullDto | null> {
		const user: User | null = await this._usersRepository.getByField('id', id);

		return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async getByEmail(email: string): Promise<UserShortDto | null> {
		const user: User | null = await this._usersRepository.getByField('email', email);

		return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async getByNickname(nickname: string): Promise<UserShortDto | null> {
		const user: User | null = await this._usersRepository.getByField('nickname', nickname);

		return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async getByResetPasswordToken(token: string): Promise<UserFullDto | null> {
		const foundedToken: PasswordResetToken | null =
			await this._passwordResetTokenRepository.getByField('token', token);

		if (!foundedToken) {
			return null;
		}

		const user: User | null = await this._usersRepository.getByField(
			'passwordResetTokenId',
			foundedToken.id,
		);

		return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async getAppUser(id: string): Promise<AppUserDto | null> {
		const user: User | null = await this._usersRepository.getByField('id', id);

		return user
			? plainToInstance(AppUserDto, user, {
					excludeExtraneousValues: true,
				})
			: null;
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
			accountSettings: await this._accountSettingsRepository.getById(accountSettingsId),
			OTPCode: await this._otpCodesRepository.getUserOTPCodeById(otpCodeId),
			password: hashedPassword,
		});

		const createdUserId: string = await this._usersRepository.createUser(userForCreation);

		const user: User | null = await this._usersRepository.getByField('id', createdUserId);

		return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
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

	private _getUsersSearchPagination(
		page?: number,
		take: number = 10,
	): { skip: number; take: number } {
		return {
			skip: !page ? 0 : page * take - take,
			take,
		};
	}
}
