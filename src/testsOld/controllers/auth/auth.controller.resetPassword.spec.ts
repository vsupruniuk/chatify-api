import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import * as request from 'supertest';
import { AuthController } from '@controllers/auth/auth.controller';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { IUsersService } from '@services/users/IUsersService';
import { UserFullDto } from '../../../types/dto/users/UserFull.dto';
import { IEmailService } from '@services/email/IEmailService';
import { IPasswordResetTokensService } from '@services/passwordResetToken/IPasswordResetTokensService';
import { AppModule } from '@modules/app.module';
import { AuthModule } from '@modules/auth.module';
import { CustomProviders } from '../../../enums/CustomProviders.enum';
import { ResetPasswordRequestDto } from '@dtos/auth/resetPassword/ResetPasswordRequest.dto';
import { SuccessfulResponseResult } from '@responses/successfulResponses/SuccessfulResponseResult';
import { ResponseStatus } from '../../../enums/ResponseStatus.enum';

describe.skip('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const usersMock: User[] = [...users];

	const usersServiceMock: Partial<IUsersService> = {
		getFullUserByEmail: jest
			.fn()
			.mockImplementation(async (userEmail: string): Promise<UserFullDto | null> => {
				const user: User | null = usersMock.find((user: User) => user.email === userEmail) || null;

				return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
			}),
	};

	const emailServiceMock: Partial<IEmailService> = {
		sendResetPasswordEmail: jest.fn(),
	};

	const passwordResetTokenServiceMock: Partial<IPasswordResetTokensService> = {
		saveToken: jest.fn().mockImplementation(async (): Promise<string> => {
			return 'password-reset-token';
		}),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.CTF_USERS_SERVICE)
			.useValue(usersServiceMock)
			.overrideProvider(CustomProviders.CTF_EMAIL_SERVICE)
			.useValue(emailServiceMock)
			.overrideProvider(CustomProviders.CTF_PASSWORD_RESET_TOKENS_SERVICE)
			.useValue(passwordResetTokenServiceMock)
			.compile();

		app = moduleFixture.createNestApplication();
		authController = moduleFixture.get<AuthController>(AuthController);

		app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: false }));

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('POST /auth/reset-password', (): void => {
		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(authController.resetPassword).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.resetPassword).toBeInstanceOf(Function);
		});

		it('should return 400 status if email is missed', async (): Promise<void> => {
			await request(app.getHttpServer())
				.post('/auth/reset-password')
				.send({})
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if email in wrong format', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordRequestDto = {
				email: 'tonymail.com',
			};

			await request(app.getHttpServer())
				.post('/auth/reset-password')
				.send(resetPasswordDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if email in wrong format', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordRequestDto = {
				email: 'tony@mail.com'.padStart(256, 't'),
			};

			await request(app.getHttpServer())
				.post('/auth/reset-password')
				.send(resetPasswordDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 404 status if user with this email not exist', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordRequestDto = {
				email: 'bruce@mail.com',
			};

			await request(app.getHttpServer())
				.post('/auth/reset-password')
				.send(resetPasswordDto)
				.expect(HttpStatus.NOT_FOUND);
		});

		it('should return 200 status if user with this email exist and token was generated', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordRequestDto = {
				email: 'tony@mail.com',
			};

			const responseResult: SuccessfulResponseResult<null> = {
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [],
				dataLength: 0,
			};

			await request(app.getHttpServer())
				.post('/auth/reset-password')
				.send(resetPasswordDto)
				.expect(HttpStatus.OK)
				.expect(responseResult);
		});

		it('should return nothing', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordRequestDto = {
				email: 'tony@mail.com',
			};

			const responseResult: void = await authController.resetPassword(resetPasswordDto);

			expect(responseResult).toBeUndefined();
		});

		it('should call getFullUserByEmail method in users service to find user', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordRequestDto = {
				email: 'tony@mail.com',
			};

			await authController.resetPassword(resetPasswordDto);

			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledWith(resetPasswordDto.email);
		});

		it('should call createPasswordResetToken method in users service to create token', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordRequestDto = {
				email: 'tony@mail.com',
			};

			const userId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
			const passwordResetTokenId: string = '1';

			await authController.resetPassword(resetPasswordDto);

			expect(passwordResetTokenServiceMock.saveToken).toHaveBeenCalledTimes(1);
			expect(passwordResetTokenServiceMock.saveToken).toHaveBeenCalledWith(
				userId,
				passwordResetTokenId,
			);
		});

		it('should call sendResetPasswordEmail method in email service to send email with reset link', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordRequestDto = {
				email: 'tony@mail.com',
			};

			const userName: string = 'Tony';
			const token: string = 'password-reset-token';

			await authController.resetPassword(resetPasswordDto);

			expect(emailServiceMock.sendResetPasswordEmail).toHaveBeenCalledTimes(1);
			expect(emailServiceMock.sendResetPasswordEmail).toHaveBeenCalledWith(
				resetPasswordDto.email,
				userName,
				token,
			);
		});
	});
});
