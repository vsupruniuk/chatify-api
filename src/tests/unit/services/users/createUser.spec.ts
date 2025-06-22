import { UsersService } from '@services/users/users.service';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { OTPCode } from '@entities/OTPCode.entity';
import { otpCodes } from '@testMocks/OTPCode/otpCodes';
import { SignupRequestDto } from '@dtos/auth/signup/SignupRequest.dto';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';

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
		usersRepository = moduleFixture.get(CustomProviders.CTF_USERS_REPOSITORY);
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

		it('should be defined', (): void => {
			expect(usersService.createUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.createUser).toBeInstanceOf(Function);
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
