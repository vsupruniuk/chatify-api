import { ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { AppUserService, IUsersService } from '@services';

import { providers } from '@modules/providers';

import { CustomProvider } from '@enums';

import { AccountSettings, User } from '@entities';

import { accountSettings, users } from '@testMocks';

import { IUsersRepository } from '@repositories';

import { JwtPayloadDto } from '@dtos/jwt';
import { UpdateAppUserRequestDto } from '@dtos/appUser';
import { UserDto, UserWithAccountSettingsDto } from '@dtos/users';

describe('App user service', (): void => {
	let appUserService: AppUserService;
	let usersService: IUsersService;
	let usersRepository: IUsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AppUserService,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		appUserService = moduleFixture.get(AppUserService);
		usersService = moduleFixture.get(CustomProvider.CTF_USERS_SERVICE);
		usersRepository = moduleFixture.get(CustomProvider.CTF_USERS_REPOSITORY);
	});

	describe('Update app user', (): void => {
		const userMock: User = users[3];
		const accountSettingsMock: AccountSettings = accountSettings[3];

		const appUserPayload: JwtPayloadDto = {
			id: userMock.id,
			email: userMock.email,
			firstName: userMock.firstName,
			lastName: userMock.lastName,
			nickname: userMock.nickname,
		};

		const updateAppUserRequestDto: UpdateAppUserRequestDto = {
			about: 'Avenger',
			firstName: 'Tony',
			lastName: 'Stark',
		};

		beforeEach((): void => {
			jest
				.spyOn(usersService, 'getByNickname')
				.mockResolvedValue(plainToInstance(UserDto, userMock, { excludeExtraneousValues: true }));
			jest
				.spyOn(usersRepository, 'updateAppUser')
				.mockResolvedValue({ ...userMock, accountSettings: { ...accountSettingsMock } });
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get by nickname method from users service if nickname is present in dto and its a new', async (): Promise<void> => {
			jest.spyOn(usersService, 'getByNickname').mockResolvedValue(null);

			const nickname: string = 't.stark';

			await appUserService.updateAppUser(appUserPayload, {
				...updateAppUserRequestDto,
				nickname,
			});

			expect(usersService.getByNickname).toHaveBeenCalledTimes(1);
			expect(usersService.getByNickname).toHaveBeenNthCalledWith(1, nickname);
		});

		it('should throw conflict exception if new nickname is present in dto but user with this nickname already exist', async (): Promise<void> => {
			await expect(
				appUserService.updateAppUser(appUserPayload, {
					...updateAppUserRequestDto,
					nickname: 't.stark',
				}),
			).rejects.toThrow(ConflictException);
		});

		it('should not throw conflict exception if new nickname is present in dto and user with this nickname does not exist', async (): Promise<void> => {
			jest.spyOn(usersService, 'getByNickname').mockResolvedValue(null);

			await expect(
				appUserService.updateAppUser(appUserPayload, {
					...updateAppUserRequestDto,
					nickname: 't.stark',
				}),
			).resolves.not.toThrow(ConflictException);
		});

		it('should not call get by nickname method from users service if nickname is present in dto but the same as current', async (): Promise<void> => {
			await appUserService.updateAppUser(appUserPayload, {
				...updateAppUserRequestDto,
				nickname: appUserPayload.nickname,
			});

			expect(usersService.getByNickname).not.toHaveBeenCalled();
		});

		it('should not call get by nickname method from users service if nickname is not present in dto', async (): Promise<void> => {
			await appUserService.updateAppUser(appUserPayload, updateAppUserRequestDto);

			expect(usersService.getByNickname).not.toHaveBeenCalled();
		});

		it('should call update app user method from users repository to update a user', async (): Promise<void> => {
			await appUserService.updateAppUser(appUserPayload, updateAppUserRequestDto);

			expect(usersRepository.updateAppUser).toHaveBeenCalledTimes(1);
			expect(usersRepository.updateAppUser).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				updateAppUserRequestDto,
			);
		});

		it('should throw unprocessable entity exception if users repository failed to update the user', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'updateAppUser').mockResolvedValue(null);

			await expect(
				appUserService.updateAppUser(appUserPayload, updateAppUserRequestDto),
			).rejects.toThrow(UnprocessableEntityException);
		});

		it('should return updated user with account settings', async (): Promise<void> => {
			const user: UserWithAccountSettingsDto = await appUserService.updateAppUser(
				appUserPayload,
				updateAppUserRequestDto,
			);

			expect(user).toEqual(
				plainToInstance(
					UserWithAccountSettingsDto,
					{ ...userMock, accountSettings: { ...accountSettingsMock } },
					{ excludeExtraneousValues: true },
				),
			);
		});

		it('should return response as instance of UserWithAccountSettingsDto', async (): Promise<void> => {
			const user: UserWithAccountSettingsDto = await appUserService.updateAppUser(
				appUserPayload,
				updateAppUserRequestDto,
			);

			expect(user).toBeInstanceOf(UserWithAccountSettingsDto);
		});
	});
});
