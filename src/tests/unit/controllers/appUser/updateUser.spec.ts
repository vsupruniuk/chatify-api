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
import { AppUserDto } from '@dtos/appUser/AppUser.dto';
import { UpdateAppUserRequestDto } from '@dtos/appUser/UpdateAppUserRequest.dto';

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

	describe('Update user', (): void => {
		const userMock: User = users[4];

		const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const updateAppUserDto: UpdateAppUserRequestDto = {
			firstName: 'Bruce',
			lastName: 'Banner',
			nickname: 'b.banner',
			about: "I'm always angry",
		};

		beforeEach((): void => {
			jest.spyOn(appUserService, 'updateAppUser').mockResolvedValue(
				plainToInstance(
					AppUserDto,
					{ ...userMock, ...updateAppUserDto },
					{
						excludeExtraneousValues: true,
					},
				),
			);
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
			const user: AppUserDto = await appUserController.updateUser(appUserPayload, updateAppUserDto);

			expect(user).toEqual(
				plainToInstance(
					AppUserDto,
					{ ...userMock, ...updateAppUserDto },
					{ excludeExtraneousValues: true },
				),
			);
		});

		it('should return a user as instance of AppUserDto', async (): Promise<void> => {
			const user: AppUserDto = await appUserController.updateUser(appUserPayload, updateAppUserDto);

			expect(user).toBeInstanceOf(AppUserDto);
		});
	});
});
