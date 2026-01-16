import { Inject, Injectable } from '@nestjs/common';

import { IUsersService } from '@services';

import {
	UserDto,
	UserWithAccountSettingsDto,
	UserWithJwtTokenDto,
	UserWithOtpCodeDto,
	FullUserWithJwtTokenDto,
	UserWithPasswordResetTokenDto,
} from '@dtos/users';
import { SignupRequestDto } from '@dtos/auth/signup';

import { CustomProvider } from '@enums';

import { IUsersRepository } from '@repositories';

import { TransformHelper, PaginationHelper } from '@helpers';

import { User } from '@entities';

@Injectable()
export class UsersService implements IUsersService {
	constructor(
		@Inject(CustomProvider.CTF_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,
	) {}

	public async getById(id: string): Promise<UserDto | null> {
		return TransformHelper.toTargetDto(UserDto, await this._usersRepository.findById(id));
	}

	public async getByNickname(nickname: string): Promise<UserDto | null> {
		return TransformHelper.toTargetDto(
			UserDto,
			await this._usersRepository.findByNickname(nickname),
		);
	}

	public async getAllByIds(ids: string[]): Promise<UserDto[]> {
		const users: User[] = await this._usersRepository.findAllByIds(ids);

		return users.map((user: User) => TransformHelper.toTargetDto(UserDto, user));
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
		return TransformHelper.toTargetDto(
			UserWithPasswordResetTokenDto,
			await this._usersRepository.findByNotExpiredPasswordResetToken(token),
		);
	}

	public async getByEmailAndNotActiveWithOtpCode(
		email: string,
	): Promise<UserWithOtpCodeDto | null> {
		return TransformHelper.toTargetDto(
			UserWithOtpCodeDto,
			await this._usersRepository.findByEmailAndNotActiveWithOtpCode(email),
		);
	}

	public async getByEmailWithPasswordResetToken(
		email: string,
	): Promise<UserWithPasswordResetTokenDto | null> {
		return TransformHelper.toTargetDto(
			UserWithPasswordResetTokenDto,
			await this._usersRepository.findByEmailWithPasswordResetToken(email),
		);
	}

	public async getFullUserWithJwtTokenByEmail(
		email: string,
	): Promise<FullUserWithJwtTokenDto | null> {
		return TransformHelper.toTargetDto(
			FullUserWithJwtTokenDto,
			await this._usersRepository.findFullUserWithJwtTokenByEmail(email),
		);
	}

	public async getByIdWithAccountSettings(id: string): Promise<UserWithAccountSettingsDto | null> {
		return TransformHelper.toTargetDto(
			UserWithAccountSettingsDto,
			await this._usersRepository.findByIdWithAccountSettings(id),
		);
	}

	public async getActivatedUsersByNickname(
		nickname: string,
		page: number,
		take: number,
	): Promise<UserDto[]> {
		const { skip: skipRecords, take: takeRecords } = PaginationHelper.toSqlPagination(page, take);

		const users: User[] = await this._usersRepository.findUsersByNicknameAndActive(
			nickname,
			skipRecords,
			takeRecords,
		);

		return users.map((user: User) => TransformHelper.toTargetDto(UserDto, user));
	}

	public async createUser(
		otpCode: number,
		otpCodeExpiresAt: string,
		signupRequestDto: SignupRequestDto,
	): Promise<void> {
		await this._usersRepository.createUser(otpCode, otpCodeExpiresAt, signupRequestDto);
	}

	public async activateUser(
		userId: string,
		otpCodeId: string,
	): Promise<UserWithJwtTokenDto | null> {
		return TransformHelper.toTargetDto(
			UserWithJwtTokenDto,
			await this._usersRepository.activateUser(userId, otpCodeId),
		);
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
}
