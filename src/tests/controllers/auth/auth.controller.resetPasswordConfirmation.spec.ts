import { AuthController } from '@Controllers/auth.controller';
import { ResetPasswordConfirmationDto } from '@DTO/auth/ResetPasswordConfirmation.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { User } from '@Entities/User.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { users } from '@TestMocks/User/users';
import { plainToInstance } from 'class-transformer';
import * as request from 'supertest';
import { IPasswordResetTokensService } from '@Interfaces/passwordResetTokens/IPasswordResetTokens.service';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
import { passwordResetTokens } from '@TestMocks/PasswordResetToken/passwordResetTokens';

describe('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const usersMock: User[] = [...users];
	const passwordResetTokensMock: PasswordResetToken[] = [...passwordResetTokens];
	const existingToken: string = '35b61c45-f134-4e6c-af56-3a72982d3d9e';
	const notExistingToken: string = '809843c4-dab7-4ed3-8de8-71e8c7ba0050';
	const existingTokenId: string = '1';

	const usersServiceMock: Partial<IUsersService> = {
		getByResetPasswordToken: jest
			.fn()
			.mockImplementation(async (token: string): Promise<UserFullDto | null> => {
				return token === existingToken
					? plainToInstance(UserFullDto, usersMock[0], { excludeExtraneousValues: true })
					: null;
			}),

		updateUser: jest.fn().mockImplementation(async (userId: string): Promise<boolean> => {
			return usersMock.some((user: User) => user.id === userId);
		}),
	};

	const passwordResetTokensService: Partial<IPasswordResetTokensService> = {
		deleteToken: jest.fn().mockImplementation(async (tokenId: string): Promise<boolean> => {
			return passwordResetTokensMock.some((token: PasswordResetToken) => token.id === tokenId);
		}),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.I_USERS_SERVICE)
			.useValue(usersServiceMock)
			.overrideProvider(CustomProviders.I_PASSWORD_RESET_TOKENS_SERVICE)
			.useValue(passwordResetTokensService)
			.compile();

		app = moduleFixture.createNestApplication();
		authController = moduleFixture.get<AuthController>(AuthController);

		app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: false }));

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('POST /reset-password/:resetToken', (): void => {
		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(authController.resetPasswordConfirmation).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.resetPasswordConfirmation).toBeInstanceOf(Function);
		});

		it('should return 400 status if reset token is not valid UUID', async (): Promise<void> => {
			const resetPasswordConfirmationDto: ResetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/reset-password/111')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password missed', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				passwordConfirmation: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if passwordConfirmation missed', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password and passwordConfirmation did not match', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1AA',
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password is not a string', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 123,
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password did not includes at least 1 number', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwertyAA',
				passwordConfirmation: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password did not includes at least 1 uppercase character', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty11',
				passwordConfirmation: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password too short', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwert',
				passwordConfirmation: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password too long', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A'.padStart(256, 'q'),
				passwordConfirmation: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if passwordConfirmation is not a string', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwertyAA',
				passwordConfirmation: 123,
			};

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if passwordConfirmation did not includes at least 1 number', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwertyAA',
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if passwordConfirmation did not includes at least 1 uppercase character', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty11',
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if passwordConfirmation too short', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwert',
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if passwordConfirmation too long', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A'.padStart(256, 'q'),
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post('/auth/reset-password/1662043c-4d4b-4424-ac31-45189dedd099')
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 404 status if user with given reset token not exist', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			await request(app.getHttpServer())
				.post(`/auth/reset-password/${notExistingToken}`)
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.NOT_FOUND);
		});

		it('should return 200 status if password and passwordConfirmation are valid', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			const responseResult: SuccessfulResponseResult<null> = {
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [],
				dataLength: 0,
			};

			await request(app.getHttpServer())
				.post(`/auth/reset-password/${existingToken}`)
				.send(resetPasswordConfirmationDto)
				.expect(HttpStatus.OK)
				.expect(responseResult);
		});

		it('should call getByResetPasswordToken in users service to find user by reset token', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			await authController.resetPasswordConfirmation(resetPasswordConfirmationDto, existingToken);

			expect(usersServiceMock.getByResetPasswordToken).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getByResetPasswordToken).toHaveBeenCalledWith(existingToken);
		});

		it('should call updateUser in users service to update user password', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			const userId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';

			await authController.resetPasswordConfirmation(resetPasswordConfirmationDto, existingToken);

			expect(usersServiceMock.updateUser).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.updateUser).toHaveBeenCalledWith(userId, {
				password: resetPasswordConfirmationDto.password,
			});
		});

		it('should call delete token in password reset tokens to delete used password reset token', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			await authController.resetPasswordConfirmation(resetPasswordConfirmationDto, existingToken);

			expect(passwordResetTokensService.deleteToken).toHaveBeenCalledTimes(1);
			expect(passwordResetTokensService.deleteToken).toHaveBeenCalledWith(existingTokenId);
		});

		it('should return response as instance of ResponseResult', async (): Promise<void> => {
			const resetPasswordConfirmationDto = {
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			} as ResetPasswordConfirmationDto;

			const result: ResponseResult = await authController.resetPasswordConfirmation(
				resetPasswordConfirmationDto,
				existingToken,
			);

			expect(result).toBeInstanceOf(SuccessfulResponseResult);
		});
	});
});
