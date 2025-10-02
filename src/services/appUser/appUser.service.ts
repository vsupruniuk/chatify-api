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

import { AppUserDto, UpdateAppUserRequestDto } from '@dtos/appUser';
import { JWTPayloadDto } from '@dtos/jwt';
import { UserDto } from '@dtos/users';

import { User } from '@entities';

import { TransformHelper, FileHelper } from '@helpers';

import { CustomProviders } from '@enums';

import { IUsersRepository } from '@repositories';

@Injectable()
export class AppUserService implements IAppUserService {
	constructor(
		@Inject(CustomProviders.CTF_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,

		@Inject(CustomProviders.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,
	) {}

	public async getAppUser(id: string): Promise<AppUserDto> {
		const user: User | null = await this._usersRepository.findByIdWithAccountSettings(id);

		if (!user) {
			throw new NotFoundException('This user does not exist');
		}

		return TransformHelper.toTargetDto(AppUserDto, user);
	}

	public async updateAppUser(
		appUserPayload: JWTPayloadDto,
		updateAppUserDto: UpdateAppUserRequestDto,
	): Promise<AppUserDto> {
		const isNewNickname: boolean = Boolean(
			updateAppUserDto.nickname && updateAppUserDto.nickname !== appUserPayload.nickname,
		);

		if (isNewNickname && updateAppUserDto.nickname) {
			const existingUser: User | null = await this._usersRepository.findByNickname(
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

		return TransformHelper.toTargetDto(AppUserDto, updatedUser);
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
