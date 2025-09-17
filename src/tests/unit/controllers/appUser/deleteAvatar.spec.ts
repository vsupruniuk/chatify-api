import { Test, TestingModule } from '@nestjs/testing';
import { AppUserController } from '@controllers/appUser/appUser.controller';
import providers from '@modules/providers/providers';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { plainToInstance } from 'class-transformer';
import { IAppUserService } from '@services/appUser/IAppUserService';
import { CustomProviders } from '@enums/CustomProviders.enum';

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

	describe('Delete avatar', (): void => {
		const userMock: User = users[1];

		const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});

		beforeEach((): void => {
			jest.spyOn(appUserService, 'deleteUserAvatar').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call delete user avatar method from app user service to delete user avatar', async (): Promise<void> => {
			await appUserController.deleteAvatar(appUserPayload);

			expect(appUserService.deleteUserAvatar).toHaveBeenCalledTimes(1);
			expect(appUserService.deleteUserAvatar).toHaveBeenNthCalledWith(1, appUserPayload.id);
		});

		it('should return nothing', async (): Promise<void> => {
			const response: void = await appUserController.deleteAvatar(appUserPayload);

			expect(response).toBeUndefined();
		});
	});
});
