import { ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { AppUserService } from '@services';

import { providers } from '@modules/providers';

import { CustomProviders } from '@enums';

import { User } from '@entities';

import { users } from '@testMocks';

import { IUsersRepository } from '@repositories';

import { JWTPayloadDto } from '@dtos/jwt';
import { UpdateAppUserRequestDto, AppUserDto } from '@dtos/appUser';

describe('App user service', (): void => {
	let appUserService: AppUserService;
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
		usersRepository = moduleFixture.get(CustomProviders.CTF_USERS_REPOSITORY);
	});

	describe('Update app user', (): void => {
		const userMock: User = users[3];

		const appUserPayload: JWTPayloadDto = {
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
			jest.spyOn(usersRepository, 'findByNickname').mockResolvedValue(userMock);
			jest.spyOn(usersRepository, 'updateAppUser').mockResolvedValue(userMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call find by nickname method from users repository if nickname is present in dto and its a new', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findByNickname').mockResolvedValue(null);

			const nickname: string = 't.stark';

			await appUserService.updateAppUser(appUserPayload, {
				...updateAppUserRequestDto,
				nickname,
			});

			expect(usersRepository.findByNickname).toHaveBeenCalledTimes(1);
			expect(usersRepository.findByNickname).toHaveBeenNthCalledWith(1, nickname);
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
			jest.spyOn(usersRepository, 'findByNickname').mockResolvedValue(null);

			await expect(
				appUserService.updateAppUser(appUserPayload, {
					...updateAppUserRequestDto,
					nickname: 't.stark',
				}),
			).resolves.not.toThrow(ConflictException);
		});

		it('should not call find by nickname method from users repository if nickname is present in dto but the same as current', async (): Promise<void> => {
			await appUserService.updateAppUser(appUserPayload, {
				...updateAppUserRequestDto,
				nickname: appUserPayload.nickname,
			});

			expect(usersRepository.findByNickname).not.toHaveBeenCalled();
		});

		it('should not call find by nickname method from users repository if nickname is not present in dto', async (): Promise<void> => {
			await appUserService.updateAppUser(appUserPayload, updateAppUserRequestDto);

			expect(usersRepository.findByNickname).not.toHaveBeenCalled();
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

		it('should return response as instance of AppUserDto', async (): Promise<void> => {
			const user: AppUserDto = await appUserService.updateAppUser(
				appUserPayload,
				updateAppUserRequestDto,
			);

			expect(user).toBeInstanceOf(AppUserDto);
		});
	});
});
