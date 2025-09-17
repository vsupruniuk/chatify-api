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
import { PaginationHelper } from '@helpers/pagination.helper';

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

	public async getActivatedUsersByNickname(
		nickname: string,
		page?: number,
		take?: number,
	): Promise<UserDto[]> {
		const { skip: skipRecords, take: takeRecords } = PaginationHelper.toSQLPagination(page, take);

		const users: User[] = await this._usersRepository.findActivatedUsersByNickname(
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
}
