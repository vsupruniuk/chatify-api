import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { AppUserController } from '@controllers';

import { providers } from '@modules/providers';

import { User } from '@entities';

import { users } from '@testMocks';

import { UpdateAppUserRequestDto } from '@dtos/appUser';
import { UserWithAccountSettingsDto } from '@dtos/users';
import { JwtPayloadDto } from '@dtos/jwt';

import { IAppUserService } from '@services';

import { CustomProvider } from '@enums';

describe('App user controller', (): void => {
	let appUserController: AppUserController;
	let appUserService: IAppUserService;

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
		appUserService = moduleFixture.get(CustomProvider.CTF_APP_USER_SERVICE);
	});

	describe('Update user', (): void => {
		const userMock: User = users[4];

		const appUserPayload: JwtPayloadDto = plainToInstance(JwtPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const updateAppUserDto: UpdateAppUserRequestDto = {
			firstName: 'Bruce',
			lastName: 'Banner',
			nickname: 'b.banner',
			about: "I'm always angry",
		};

		const updatedUserMock: UserWithAccountSettingsDto = plainToInstance(
			UserWithAccountSettingsDto,
			{ ...userMock, ...updateAppUserDto },
			{ excludeExtraneousValues: true },
		);

		beforeEach((): void => {
			jest.spyOn(appUserService, 'updateAppUser').mockResolvedValue(updatedUserMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call update user method from app user service to update user information', async (): Promise<void> => {
			await appUserController.updateUser(appUserPayload, updateAppUserDto);

			expect(appUserService.updateAppUser).toHaveBeenCalledTimes(1);
			expect(appUserService.updateAppUser).toHaveBeenNthCalledWith(
				1,
				appUserPayload,
				updateAppUserDto,
			);
		});

		it('should return updated user', async (): Promise<void> => {
			const user: UserWithAccountSettingsDto = await appUserController.updateUser(
				appUserPayload,
				updateAppUserDto,
			);

			expect(user).toEqual(updatedUserMock);
		});

		it('should return a user as instance of AppUserDto', async (): Promise<void> => {
			const user: UserWithAccountSettingsDto = await appUserController.updateUser(
				appUserPayload,
				updateAppUserDto,
			);

			expect(user).toBeInstanceOf(UserWithAccountSettingsDto);
		});
	});
});
