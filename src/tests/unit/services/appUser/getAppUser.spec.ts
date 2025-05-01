import { AppUserService } from '@services/appUser/appUser.service';
import { UsersRepository } from '@repositories/users/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import providers from '@modules/providers/providers';
import { TransformHelper } from '@helpers/transform.helper';
import { AppUserDto } from '@dtos/appUser/AppUser.dto';
import { NotFoundException } from '@nestjs/common';

describe('App user service', (): void => {
	let appUserService: AppUserService;
	let usersRepository: UsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AppUserService,

				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		appUserService = moduleFixture.get(AppUserService);
		usersRepository = moduleFixture.get(CustomProviders.CTF_USERS_REPOSITORY);
	});

	describe('Get app user', (): void => {
		const userMock: User = users[5];
		const userIdMock: string = userMock.id;

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'findByIdWithAccountSettings').mockResolvedValue(userMock);
			jest.spyOn(TransformHelper, 'toTargetDto');
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});
		it('should be defined', (): void => {
			expect(appUserService.getAppUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(appUserService.getAppUser).toBeInstanceOf(Function);
		});

		it('should call find by id with account settings method from users repository to find user', async (): Promise<void> => {
			await appUserService.getAppUser(userIdMock);

			expect(usersRepository.findByIdWithAccountSettings).toHaveBeenCalledTimes(1);
			expect(usersRepository.findByIdWithAccountSettings).toHaveBeenNthCalledWith(1, userIdMock);
		});

		it('should call to target dto method from transform helper to transform response to appropriate dto', async (): Promise<void> => {
			await appUserService.getAppUser(userIdMock);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(1);
			expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(1, AppUserDto, userMock);
		});

		it('should throw not found exception if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findByIdWithAccountSettings').mockResolvedValue(null);

			await expect(appUserService.getAppUser(userIdMock)).rejects.toThrow(NotFoundException);
		});

		it('should return founded user', async (): Promise<void> => {
			const user: AppUserDto = await appUserService.getAppUser(userIdMock);

			expect(user.id).toBe(userMock.id);
		});

		it('should return response as instance of AppUserDto', async (): Promise<void> => {
			const user: AppUserDto = await appUserService.getAppUser(userIdMock);

			expect(user).toBeInstanceOf(AppUserDto);
		});
	});
});
