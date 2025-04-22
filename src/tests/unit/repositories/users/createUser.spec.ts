import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { UsersRepository } from '@repositories/users/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, InsertResult } from 'typeorm';
import { SignupRequestDto } from '@dtos/auth/signup/SignupRequest.dto';
import { AccountSettings } from '@entities/AccountSettings.entity';
import { JWTToken } from '@entities/JWTToken.entity';
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';
import { OTPCode } from '@entities/OTPCode.entity';
import { User } from '@entities/User.entity';

describe('Users repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let usersRepository: UsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, UsersRepository],
		}).compile();

		usersRepository = moduleFixture.get(UsersRepository);
	});

	describe('Create user', (): void => {
		const insertResultMock: InsertResult = {
			generatedMaps: [{ id: 'e0770f94-b05f-43d4-85c5-a67dd1e132cd' }],
			identifiers: [],
			raw: {},
		};

		const otpCodeMock: number = 580268;
		const otpCodeExpiresAtMock: string = '2025-04-22 00:15:00';

		const signupRequestDto: SignupRequestDto = {
			email: 'tony.stark@avengers.com',
			firstName: 'Tony',
			lastName: 'Stark',
			nickname: 't.stark',
			password: 'Qwerty12345!',
			passwordConfirmation: 'Qwerty12345!',
		};

		beforeEach((): void => {
			queryBuilderMock.execute.mockReturnValue(insertResultMock);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersRepository.createUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.createUser).toBeInstanceOf(Function);
		});

		it('should use query builder and create user default account setting', async (): Promise<void> => {
			await usersRepository.createUser(otpCodeMock, otpCodeExpiresAtMock, signupRequestDto);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(5);

			expect(queryBuilderMock.insert).toHaveBeenCalledTimes(5);

			expect(queryBuilderMock.into).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.into).toHaveBeenNthCalledWith(1, AccountSettings);

			expect(queryBuilderMock.values).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.values).toHaveBeenNthCalledWith(1, {});

			expect(queryBuilderMock.returning).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.returning).toHaveBeenNthCalledWith(1, '*');

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(5);
		});

		it('should use query builder and create user default JWT token record', async (): Promise<void> => {
			await usersRepository.createUser(otpCodeMock, otpCodeExpiresAtMock, signupRequestDto);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(5);

			expect(queryBuilderMock.insert).toHaveBeenCalledTimes(5);

			expect(queryBuilderMock.into).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.into).toHaveBeenNthCalledWith(2, JWTToken);

			expect(queryBuilderMock.values).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.values).toHaveBeenNthCalledWith(2, {});

			expect(queryBuilderMock.returning).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.returning).toHaveBeenNthCalledWith(2, '*');

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(5);
		});

		it('should use query builder and create user default password reset token record', async (): Promise<void> => {
			await usersRepository.createUser(otpCodeMock, otpCodeExpiresAtMock, signupRequestDto);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(5);

			expect(queryBuilderMock.insert).toHaveBeenCalledTimes(5);

			expect(queryBuilderMock.into).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.into).toHaveBeenNthCalledWith(3, PasswordResetToken);

			expect(queryBuilderMock.values).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.values).toHaveBeenNthCalledWith(3, {});

			expect(queryBuilderMock.returning).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.returning).toHaveBeenNthCalledWith(3, '*');

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(5);
		});

		it('should use query builder and create user default OTP code record', async (): Promise<void> => {
			await usersRepository.createUser(otpCodeMock, otpCodeExpiresAtMock, signupRequestDto);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(5);

			expect(queryBuilderMock.insert).toHaveBeenCalledTimes(5);

			expect(queryBuilderMock.into).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.into).toHaveBeenNthCalledWith(4, OTPCode);

			expect(queryBuilderMock.values).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.values).toHaveBeenNthCalledWith(4, {
				code: otpCodeMock,
				expiresAt: otpCodeExpiresAtMock,
			});

			expect(queryBuilderMock.returning).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.returning).toHaveBeenNthCalledWith(4, '*');

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(5);
		});

		it('should use query builder and create a user', async (): Promise<void> => {
			await usersRepository.createUser(otpCodeMock, otpCodeExpiresAtMock, signupRequestDto);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(5);

			expect(queryBuilderMock.insert).toHaveBeenCalledTimes(5);

			expect(queryBuilderMock.into).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.into).toHaveBeenNthCalledWith(5, User);

			expect(queryBuilderMock.values).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.values).toHaveBeenNthCalledWith(5, {
				email: signupRequestDto.email,
				firstName: signupRequestDto.firstName,
				lastName: signupRequestDto.lastName,
				nickname: signupRequestDto.nickname,
				password: signupRequestDto.password,
				passwordConfirmation: signupRequestDto.passwordConfirmation,
				accountSettings: insertResultMock.generatedMaps[0],
				jwtToken: insertResultMock.generatedMaps[0],
				passwordResetToken: insertResultMock.generatedMaps[0],
				otpCode: insertResultMock.generatedMaps[0],
			});

			expect(queryBuilderMock.returning).toHaveBeenCalledTimes(5);
			expect(queryBuilderMock.returning).toHaveBeenNthCalledWith(5, '*');

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(5);
		});

		it('should use a transaction to rollback all changes in case of any errors', async (): Promise<void> => {
			await usersRepository.createUser(otpCodeMock, otpCodeExpiresAtMock, signupRequestDto);

			expect(queryBuilderMock.transaction).toHaveBeenCalledTimes(1);
		});

		it('should return created user', async (): Promise<void> => {
			const user: User = await usersRepository.createUser(
				otpCodeMock,
				otpCodeExpiresAtMock,
				signupRequestDto,
			);

			expect(user).toEqual(insertResultMock.generatedMaps[0]);
		});
	});
});
