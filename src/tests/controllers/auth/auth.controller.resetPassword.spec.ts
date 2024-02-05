import { AuthController } from '@Controllers/auth.controller';
import { ResetPasswordDto } from '@DTO/auth/ResetPassword.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { IEmailService } from '@Interfaces/emails/IEmailService';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { users } from '@TestMocks/UserFullDto/users';
import * as request from 'supertest';

describe('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const usersMock: UserFullDto[] = [...users];

	const usersServiceMock: Partial<IUsersService> = {
		getByEmail: jest
			.fn()
			.mockImplementation(async (userEmail: string): Promise<UserShortDto | null> => {
				return usersMock.find((user: UserShortDto) => user.email === userEmail) || null;
			}),

		createPasswordResetToken: jest
			.fn()
			.mockImplementation(async (userId: string): Promise<string | null> => {
				const isUserExist: UserFullDto | null =
					usersMock.find((user: UserFullDto) => user.id === userId) || null;

				return isUserExist ? 'uuid-reset-token' : null;
			}),
	};

	const emailServiceMock: Partial<IEmailService> = {
		sendResetPasswordEmail: jest.fn(),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.I_USERS_SERVICE)
			.useValue(usersServiceMock)
			.overrideProvider(CustomProviders.I_EMAIL_SERVICE)
			.useValue(emailServiceMock)
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
			const resetPasswordDto: ResetPasswordDto = {
				email: 'tonymail.com',
			};

			await request(app.getHttpServer())
				.post('/auth/reset-password')
				.send(resetPasswordDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if email in wrong format', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordDto = {
				email: 'tony@mail.com'.padStart(256, 't'),
			};

			await request(app.getHttpServer())
				.post('/auth/reset-password')
				.send(resetPasswordDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 404 status if user with this email not exist', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordDto = {
				email: 'bruce@mail.com',
			};

			await request(app.getHttpServer())
				.post('/auth/reset-password')
				.send(resetPasswordDto)
				.expect(HttpStatus.NOT_FOUND);
		});

		it('should return 200 status if user with this email exist and token was generated', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordDto = {
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

		it('should return response as instance of ResponseResult', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordDto = {
				email: 'tony@mail.com',
			};

			const responseResult: ResponseResult = await authController.resetPassword(resetPasswordDto);

			expect(responseResult).toBeInstanceOf(ResponseResult);
		});

		it('should call getByEmail method in users service to find user', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordDto = {
				email: 'tony@mail.com',
			};

			await authController.resetPassword(resetPasswordDto);

			expect(usersServiceMock.getByEmail).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getByEmail).toHaveBeenCalledWith(resetPasswordDto.email);
		});

		it('should call createPasswordResetToken method in users service to create token', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordDto = {
				email: 'tony@mail.com',
			};

			const userId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';

			await authController.resetPassword(resetPasswordDto);

			expect(usersServiceMock.createPasswordResetToken).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.createPasswordResetToken).toHaveBeenCalledWith(userId);
		});

		it('should call sendResetPasswordEmail method in email service to send email with reset link', async (): Promise<void> => {
			const resetPasswordDto: ResetPasswordDto = {
				email: 'tony@mail.com',
			};

			const userName: string = 'Tony';
			const token: string = 'uuid-reset-token';

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
