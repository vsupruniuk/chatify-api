import { IUsersService } from '@services/users/IUsersService';
import { Inject, Injectable } from '@nestjs/common';
import { UserDto } from '@dtos/users/UserDto';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { TransformHelper } from '@helpers/transform.helper';
import { SignupRequestDto } from '@dtos/auth/signup/SignupRequest.dto';
import { User } from '@entities/User.entity';
import { UserWithOtpCodeDto } from '@dtos/users/UserWithOtpCodeDto';
import { UserWithJwtTokenDto } from '@dtos/users/UserWithJwtTokenDto';
import { UserWithPasswordResetTokenDto } from '@dtos/users/UserWithPasswordResetTokenDto';
import { FullUserWithJwtTokenDto } from '@dtos/users/FullUserWithJwtTokenDto';

@Injectable()
export class UsersService implements IUsersService {
	constructor(
		@Inject(CustomProviders.CTF_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,
	) {}

	public async getById(id: string): Promise<UserDto | null> {
		const user: User | null = await this._usersRepository.findById(id);

		return TransformHelper.toTargetDto(UserDto, user);
	}

	public async getByEmailOrNickname(email: string, nickname: string): Promise<UserDto | null> {
		return TransformHelper.toTargetDto(
			UserDto,
			await this._usersRepository.findByEmailOrNickname(email, nickname),
		);
	}

	public async getByNotExpiredPasswordResetToken(
		token: string,
	): Promise<UserWithPasswordResetTokenDto | null> {
		const user: User | null = await this._usersRepository.findByNotExpiredPasswordResetToken(token);

		return TransformHelper.toTargetDto(UserWithPasswordResetTokenDto, user);
	}

	public async getByEmailAndNotActiveWithOtpCode(
		email: string,
	): Promise<UserWithOtpCodeDto | null> {
		const user: User | null = await this._usersRepository.findByEmailAndNotActiveWithOtpCode(email);

		return TransformHelper.toTargetDto(UserWithOtpCodeDto, user);
	}

	public async getByEmailWithPasswordResetToken(
		email: string,
	): Promise<UserWithPasswordResetTokenDto | null> {
		const user: User | null = await this._usersRepository.findByEmailWithPasswordResetToken(email);

		return TransformHelper.toTargetDto(UserWithPasswordResetTokenDto, user);
	}

	public async getFullUserWithJwtTokenByEmail(
		email: string,
	): Promise<FullUserWithJwtTokenDto | null> {
		const user: User | null = await this._usersRepository.findFullUserWithJwtTokenByEmail(email);

		return TransformHelper.toTargetDto(FullUserWithJwtTokenDto, user);
	}

	public async createUser(
		otpCode: number,
		otpCodeExpiresAt: string,
		signupRequestDto: SignupRequestDto,
	): Promise<boolean> {
		const user: User | null = await this._usersRepository.createUser(
			otpCode,
			otpCodeExpiresAt,
			signupRequestDto,
		);

		return Boolean(user);
	}

	public async activateUser(
		userId: string,
		otpCodeId: string,
	): Promise<UserWithJwtTokenDto | null> {
		const activatedUser: User | null = await this._usersRepository.activateUser(userId, otpCodeId);

		return TransformHelper.toTargetDto(UserWithJwtTokenDto, activatedUser);
	}

	public async changeUserPassword(
		userId: string,
		tokenId: string,
		password: string,
	): Promise<boolean> {
		const user: User | null = await this._usersRepository.updatePassword(userId, tokenId, password);

		return !!user && user.password === password;
	}

	public async updateUserAvatarUrl(userId: string, avatarUrl: string | null): Promise<void> {
		await this._usersRepository.updateUserAvatarUrl(userId, avatarUrl);
	}

	// // TODO check if needed
	// public async getPublicUsers(
	// 	userNickname: string,
	// 	nickname: string,
	// 	page?: number,
	// 	take?: number,
	// ): Promise<UserPublicDto[]> {
	// 	const { skip: skipRecords, take: takeRecords } = this._getUsersSearchPagination(page, take);
	//
	// 	const users: User[] = await this._usersRepository.getPublicUsers(
	// 		nickname,
	// 		skipRecords,
	// 		takeRecords,
	// 	);
	//
	// 	return users
	// 		.filter((user: User) => user.nickname !== userNickname)
	// 		.map((user: User) => {
	// 			return plainToInstance(UserPublicDto, user, { excludeExtraneousValues: true });
	// 		});
	// }
	//
	// // TODO check if needed
	// public async getFullUserByEmail(email: string): Promise<UserFullDto | null> {
	// 	const user: User | null = await this._usersRepository.getByField('email', email);
	//
	// 	return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
	// }
	//
	// // TODO check if needed
	// public async getFullUserById(id: string): Promise<UserFullDto | null> {
	// 	const user: User | null = await this._usersRepository.getByField('id', id);
	//
	// 	return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
	// }
	//
	// // TODO check if needed
	// public async getByEmail(email: string): Promise<UserShortDto | null> {
	// 	const user: User | null = await this._usersRepository.getByField('email', email);
	//
	// 	return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
	// }
	//
	// // TODO check if needed
	// public async getByNickname(nickname: string): Promise<UserShortDto | null> {
	// 	const user: User | null = await this._usersRepository.getByField('nickname', nickname);
	//
	// 	return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
	// }
	//
	// // TODO check if needed
	// public async getByEmailOrNickname(email: string, nickname: string): Promise<UserShortDto | null> {
	// 	const user: User | null = await this._usersRepository.getByEmailOrNickname(email, nickname);
	//
	// 	return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
	// }
	//
	// // TODO check if needed
	// public async getByResetPasswordToken(token: string): Promise<UserFullDto | null> {
	// 	const foundedToken: PasswordResetToken | null =
	// 		await this._passwordResetTokenRepository.getByField('token', token);
	//
	// 	if (!foundedToken) {
	// 		return null;
	// 	}
	//
	// 	const isTokenExpired: boolean = PasswordResetTokensHelper.isExpired(
	// 		plainToInstance(PasswordResetTokenDto, foundedToken, { excludeExtraneousValues: true }),
	// 	);
	//
	// 	if (isTokenExpired) {
	// 		return null;
	// 	}
	//
	// 	const user: User | null = await this._usersRepository.getByField(
	// 		'passwordResetTokenId',
	// 		foundedToken.id,
	// 	);
	//
	// 	return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
	// }
	//
	// public async getAppUser(id: string): Promise<AppUserDto | null> {
	// 	const user: User | null = await this._usersRepository.getByField('id', id);
	//
	// 	return user
	// 		? plainToInstance(AppUserDto, user, {
	// 				excludeExtraneousValues: true,
	// 			})
	// 		: null;
	// }
	//
	// // TODO check if needed
	// public async createUser(signupUserDto: SignupUserDto): Promise<UserShortDto | null> {
	// 	const otpCodeDTO: CreateOTPCodeDto = plainToInstance(CreateOTPCodeDto, <CreateOTPCodeDto>{
	// 		code: OTPCodesHelper.generateOTPCode(),
	// 		expiresAt: DateHelper.dateTimeFuture(1000 * 60 * 10),
	// 	});
	//
	// 	const accountSettingsId: string = await this._accountSettingsRepository.createDefaultSettings();
	// 	const otpCodeId: string = await this._otpCodesRepository.createOTPCode(otpCodeDTO);
	// 	const hashedPassword: string = await bcrypt.hash(
	// 		signupUserDto.password,
	// 		Number(process.env.PASSWORD_SALT_HASH_ROUNDS),
	// 	);
	//
	// 	const userForCreation: CreateUserDto = plainToInstance(CreateUserDto, <CreateUserDto>{
	// 		...signupUserDto,
	// 		accountSettings: await this._accountSettingsRepository.getById(accountSettingsId),
	// 		OTPCode: await this._otpCodesRepository.getUserOTPCodeById(otpCodeId),
	// 		password: hashedPassword,
	// 	});
	//
	// 	const createdUserId: string = await this._usersRepository.createUser(userForCreation);
	//
	// 	const user: User | null = await this._usersRepository.getByField('id', createdUserId);
	//
	// 	return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
	// }
	//
	// // TODO check if needed
	// public async updateUser(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<boolean> {
	// 	const updateUserDtoCopy: Partial<UpdateUserDto> = { ...updateUserDto };
	//
	// 	if (updateUserDtoCopy.password) {
	// 		updateUserDtoCopy.password = await bcrypt.hash(
	// 			updateUserDtoCopy.password,
	// 			Number(process.env.PASSWORD_SALT_HASH_ROUNDS),
	// 		);
	// 	}
	//
	// 	return await this._usersRepository.updateUser(userId, updateUserDtoCopy);
	// }
	//
	// private _getUsersSearchPagination(
	// 	page?: number,
	// 	take: number = 10,
	// ): { skip: number; take: number } {
	// 	return {
	// 		skip: !page ? 0 : page * take - take,
	// 		take,
	// 	};
	// }
}
