import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	UnauthorizedException,
	UnprocessableEntityException,
} from '@nestjs/common';

import { IAppUserService, IUsersService } from '@services';

import { UpdateAppUserRequestDto } from '@dtos/appUser';
import { JwtPayloadDto } from '@dtos/jwt';
import { UserDto, UserWithAccountSettingsDto } from '@dtos/users';

import { User } from '@entities';

import { TransformHelper, FileHelper } from '@helpers';

import { CustomProvider } from '@enums';

import { IUsersRepository } from '@repositories';

@Injectable()
export class AppUserService implements IAppUserService {
	constructor(
		@Inject(CustomProvider.CTF_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,

		@Inject(CustomProvider.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,
	) {}

	public async getAppUser(id: string): Promise<UserWithAccountSettingsDto> {
		const user: UserWithAccountSettingsDto | null =
			await this._usersService.getByIdWithAccountSettings(id);

		if (!user) {
			throw new NotFoundException('This user does not exist');
		}

		return user;
	}

	public async updateAppUser(
		appUserPayload: JwtPayloadDto,
		updateAppUserDto: UpdateAppUserRequestDto,
	): Promise<UserWithAccountSettingsDto> {
		const isNewNickname: boolean = Boolean(
			updateAppUserDto.nickname && updateAppUserDto.nickname !== appUserPayload.nickname,
		);

		if (isNewNickname && updateAppUserDto.nickname) {
			const existingUser: UserDto | null = await this._usersService.getByNickname(
				updateAppUserDto.nickname,
			);

			if (existingUser) {
				throw new ConflictException('This nickname is already taken|nickname');
			}
		}

		const updatedUser: User | null = await this._usersRepository.updateAppUser(
			appUserPayload.id,
			updateAppUserDto,
		);

		if (!updatedUser) {
			throw new UnprocessableEntityException('Failed to update user information, please try again');
		}

		return TransformHelper.toTargetDto(UserWithAccountSettingsDto, updatedUser);
	}

	public async deleteUserAvatar(userId: string): Promise<void> {
		const user: UserDto | null = await this._usersService.getById(userId);

		if (!user) {
			throw new UnauthorizedException('Please login to perform this action');
		}

		if (!user.avatarUrl) {
			throw new BadRequestException('User does not have an avatar');
		}

		FileHelper.deleteFile(user.avatarUrl);

		await this._usersService.updateUserAvatarUrl(userId, null);
	}
}
