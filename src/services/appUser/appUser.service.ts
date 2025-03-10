import { IAppUserService } from '@services/appUser/IAppUserService';
import { AppUserDto } from '@dtos/appUser/AppUser.dto';
import { User } from '@entities/User.entity';
import {
	ConflictException,
	Inject,
	NotFoundException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { TransformHelper } from '@helpers/transform.helper';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { UpdateAppUserRequestDto } from '@dtos/appUser/UpdateAppUserRequest.dto';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';

export class AppUserService implements IAppUserService {
	constructor(
		@Inject(CustomProviders.CTF_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,
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
}
