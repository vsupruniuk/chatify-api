import { AppUserController } from '@controllers/appUser/appUser.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { plainToInstance } from 'class-transformer';
import { IUsersService } from '@services/users/IUsersService';
import { UploadAvatarResponseDto } from '@dtos/accountSettings/userAvatar/UploadAvatarResponse.dto';
import { BadRequestException } from '@nestjs/common';

describe('App user controller', (): void => {
	let appUserController: AppUserController;
	let usersService: IUsersService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [AppUserController],
			providers: [
				JwtService,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				providers.CTF_APP_USER_SERVICE,

				providers.CTF_ACCOUNT_SETTINGS_SERVICE,
				providers.CTF_ACCOUNT_SETTINGS_REPOSITORY,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		appUserController = moduleFixture.get(AppUserController);
		usersService = moduleFixture.get(CustomProviders.CTF_USERS_SERVICE);
	});

	describe('Upload avatar', (): void => {
		const userMock: User = users[3];

		const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const file: Express.Multer.File = { filename: 'avatar.png' } as Express.Multer.File;

		beforeEach((): void => {
			jest.spyOn(usersService, 'updateUserAvatarUrl').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call update user avatar url method from users service to update user avatar', async (): Promise<void> => {
			await appUserController.uploadAvatar(appUserPayload, file);

			expect(usersService.updateUserAvatarUrl).toHaveBeenCalledTimes(1);
			expect(usersService.updateUserAvatarUrl).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				file.filename,
			);
		});

		it('should throw Bad Request exception if file is undefined', async (): Promise<void> => {
			await expect(appUserController.uploadAvatar(appUserPayload, undefined)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should return new avatar url', async (): Promise<void> => {
			const avatar: UploadAvatarResponseDto = await appUserController.uploadAvatar(
				appUserPayload,
				file,
			);

			expect(avatar).toEqual({ avatarUrl: file.filename });
		});
	});
});
