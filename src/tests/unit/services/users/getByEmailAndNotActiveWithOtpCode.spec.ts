import { UsersService } from '@services/users/users.service';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { OTPCode } from '@entities/OTPCode.entity';
import { otpCodes } from '@testMocks/OTPCode/otpCodes';
import { TransformHelper } from '@helpers/transform.helper';
import { plainToInstance } from 'class-transformer';
import { UserWithOtpCodeDto } from '@dtos/users/UserWithOtpCodeDto';

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

	describe('Get by email and not active with otp code', (): void => {
		const userMock: User = users[0];
		const otpCodeMock: OTPCode = otpCodes[0];

		const email: string = userMock.email;

		beforeEach((): void => {
			jest
				.spyOn(usersRepository, 'findByEmailAndNotActiveWithOtpCode')
				.mockResolvedValue({ ...userMock, otpCode: { ...otpCodeMock } });
			jest.spyOn(TransformHelper, 'toTargetDto');
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersService.getByEmailAndNotActiveWithOtpCode).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getByEmailAndNotActiveWithOtpCode).toBeInstanceOf(Function);
		});

		it('should call find by email and not active with otp code method from users repository to find a user', async (): Promise<void> => {
			await usersService.getByEmailAndNotActiveWithOtpCode(email);

			expect(usersRepository.findByEmailAndNotActiveWithOtpCode).toHaveBeenCalledTimes(1);
			expect(usersRepository.findByEmailAndNotActiveWithOtpCode).toHaveBeenNthCalledWith(1, email);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findByEmailAndNotActiveWithOtpCode').mockResolvedValue(null);

			const user: UserWithOtpCodeDto | null =
				await usersService.getByEmailAndNotActiveWithOtpCode(email);

			expect(user).toBeNull();
		});

		it('should call to target dto method from transform helper to transform response to appropriate dto', async (): Promise<void> => {
			await usersService.getByEmailAndNotActiveWithOtpCode(email);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(1);
			expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(1, UserWithOtpCodeDto, {
				...userMock,
				otpCode: { ...otpCodeMock },
			});
		});

		it('should return a user if it was found', async (): Promise<void> => {
			const user: UserWithOtpCodeDto | null =
				await usersService.getByEmailAndNotActiveWithOtpCode(email);

			expect(user).toEqual(
				plainToInstance(
					UserWithOtpCodeDto,
					{ ...userMock, otpCode: { ...otpCodeMock } },
					{ excludeExtraneousValues: true },
				),
			);
		});

		it('should return a user as instance of UserWithOtpCodeDto', async (): Promise<void> => {
			const user: UserWithOtpCodeDto | null =
				await usersService.getByEmailAndNotActiveWithOtpCode(email);

			expect(user).toBeInstanceOf(UserWithOtpCodeDto);
		});
	});
});
