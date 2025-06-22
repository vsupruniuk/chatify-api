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
import { JWTToken } from '@entities/JWTToken.entity';
import { jwtTokens } from '@testMocks/JWTToken/jwtTokens';
import { TransformHelper } from '@helpers/transform.helper';
import { UserWithJwtTokenDto } from '@dtos/users/UserWithJwtTokenDto';
import { plainToInstance } from 'class-transformer';

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

	describe('Activate user', (): void => {
		const userMock: User = users[5];
		const otpCodeMock: OTPCode = otpCodes[3];
		const jwtTokenMock: JWTToken = jwtTokens[3];

		const userId: string = userMock.id;
		const otpCodeId: string = otpCodeMock.id;

		beforeEach((): void => {
			jest
				.spyOn(usersRepository, 'activateUser')
				.mockResolvedValue({ ...userMock, jwtToken: { ...jwtTokenMock } });
			jest.spyOn(TransformHelper, 'toTargetDto');
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersService.activateUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.activateUser).toBeInstanceOf(Function);
		});

		it('should call activate user method from users repository to activate user account', async (): Promise<void> => {
			await usersService.activateUser(userId, otpCodeId);

			expect(usersRepository.activateUser).toHaveBeenCalledTimes(1);
			expect(usersRepository.activateUser).toHaveBeenNthCalledWith(1, userId, otpCodeId);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'activateUser').mockResolvedValue(null);

			const user: UserWithJwtTokenDto | null = await usersService.activateUser(userId, otpCodeId);

			expect(user).toBeNull();
		});

		it('should return founded user', async (): Promise<void> => {
			const user: UserWithJwtTokenDto | null = await usersService.activateUser(userId, otpCodeId);

			expect(user).toEqual(
				plainToInstance(
					UserWithJwtTokenDto,
					{ ...userMock, jwtToken: { ...jwtTokenMock } },
					{ excludeExtraneousValues: true },
				),
			);
		});

		it('should call to target dto method from transform helper to transform response to appropriate dto', async (): Promise<void> => {
			await usersService.activateUser(userId, otpCodeId);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(1);
			expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(1, UserWithJwtTokenDto, {
				...userMock,
				jwtToken: { ...jwtTokenMock },
			});
		});

		it('should return user as instance of UserWithJwtTokenDto', async (): Promise<void> => {
			const user: UserWithJwtTokenDto | null = await usersService.activateUser(userId, otpCodeId);

			expect(user).toBeInstanceOf(UserWithJwtTokenDto);
		});
	});
});
