import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { AppUserController } from '@controllers';

import { providers } from '@modules/providers';

import { User } from '@entities';

import { users } from '@testMocks';

import { JWTPayloadDto } from '@dtos/jwt';
import { AppUserDto } from '@dtos/appUser';

import { IAppUserService } from '@services';

import { CustomProviders } from '@enums';

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
		appUserService = moduleFixture.get(CustomProviders.CTF_APP_USER_SERVICE);
	});

	describe('Get app user', (): void => {
		const userMock: User = users[5];

		const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});

		beforeEach((): void => {
			jest.spyOn(appUserService, 'getAppUser').mockResolvedValue(
				plainToInstance(AppUserDto, userMock, {
					excludeExtraneousValues: true,
				}),
			);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get app user method from app user service to get the full app user', async (): Promise<void> => {
			await appUserController.getAppUser(appUserPayload);

			expect(appUserService.getAppUser).toHaveBeenCalledTimes(1);
			expect(appUserService.getAppUser).toHaveBeenNthCalledWith(1, appUserPayload.id);
		});

		it('should return founded user', async (): Promise<void> => {
			const user: AppUserDto = await appUserController.getAppUser(appUserPayload);

			expect(user).toEqual(
				plainToInstance(AppUserDto, userMock, { excludeExtraneousValues: true }),
			);
		});

		it('should return a user as instance of AppUserDto', async (): Promise<void> => {
			const user: AppUserDto = await appUserController.getAppUser(appUserPayload);

			expect(user).toBeInstanceOf(AppUserDto);
		});
	});
});
