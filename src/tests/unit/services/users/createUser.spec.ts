import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { UsersService } from '@services';

import { IUsersRepository } from '@repositories';

import { providers } from '@modules/providers';

import { CustomProvider } from '@enums';

import { OTPCode, User } from '@entities';

import { otpCodes, users } from '@testMocks';

import { SignupRequestDto } from '@dtos/auth/signup';

describe('Users service', (): void => {
	let usersService: UsersService;
	let usersRepository: IUsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,

				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		usersService = moduleFixture.get(UsersService);
		usersRepository = moduleFixture.get(CustomProvider.CTF_USERS_REPOSITORY);
	});

	describe('Create user', (): void => {
		const userMock: User = users[2];
		const otpCodeMock: OTPCode = otpCodes[0];

		const otpCode: number = otpCodeMock.code as number;
		const otpCodeExpiresAt: string = otpCodeMock.expiresAt as string;
		const signupRequestDto: SignupRequestDto = {
			firstName: userMock.firstName,
			lastName: userMock.lastName as string,
			nickname: userMock.nickname,
			password: userMock.password,
			passwordConfirmation: userMock.password,
			email: userMock.email,
		};

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'createUser').mockResolvedValue(userMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call create user method from users repository to create a user', async (): Promise<void> => {
			await usersService.createUser(otpCode, otpCodeExpiresAt, signupRequestDto);

			expect(usersRepository.createUser).toHaveBeenCalledTimes(1);
			expect(usersRepository.createUser).toHaveBeenNthCalledWith(
				1,
				otpCode,
				otpCodeExpiresAt,
				signupRequestDto,
			);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await usersService.createUser(
				otpCode,
				otpCodeExpiresAt,
				signupRequestDto,
			);

			expect(result).toBeUndefined();
		});
	});
});
