import { AuthController } from '@Controllers/auth.controller';
import { ResendActivationCodeDto } from '@DTO/auth/ResendActivationCode.dto';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { OTPCode } from '@Entities/OTPCode.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { EmailService } from '@Services/email.service';
import { OTPCodesService } from '@Services/OTPCodes.service';
import { UsersService } from '@Services/users.service';
import { otpCodes } from '@TestMocks/OTPCode/otpCodes';
import { users } from '@TestMocks/UserFullDto/users';
import * as request from 'supertest';

describe('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const usersMock: UserFullDto[] = [...users];
	const otpCodesMock: OTPCode[] = [...otpCodes];

	const usersServiceMock: Partial<UsersService> = {
		getFullUserByEmail: jest
			.fn()
			.mockImplementation(async (email: string): Promise<UserShortDto | null> => {
				return usersMock.find((user: UserFullDto) => user.email === email) || null;
			}),

		getUserOTPCode: jest
			.fn()
			.mockImplementation(
				async (userOTPCodeId: string | null): Promise<OTPCodeResponseDto | null> => {
					return otpCodesMock.find((otpCode: OTPCode) => otpCode.id === userOTPCodeId) || null;
				},
			),
	};

	const otpCodesServiceMock: Partial<OTPCodesService> = {
		createNewOTPCode: jest.fn().mockImplementation(async (): Promise<boolean> => {
			return true;
		}),
	};

	const emailServiceMock: Partial<EmailService> = {
		sendActivationEmail: jest.fn(),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.I_USERS_SERVICE)
			.useValue(usersServiceMock)
			.overrideProvider(CustomProviders.I_OTP_CODES_SERVICE)
			.useValue(otpCodesServiceMock)
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

	describe('POST /auth/resend-activation-code', (): void => {
		const existingUserEmail: string = 'tony@mail.com';
		const existingUserWithoutOTPCodeEmail: string = 'thor@mail.com';
		const notExistingUserEmail: string = 'vision@mail.com';
		const userOTPCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd099';

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(authController.resendActivationCode).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.resendActivationCode).toBeInstanceOf(Function);
		});

		it('should return 400 status if email is missed', async (): Promise<void> => {
			const resendActivationCodeDto = <ResendActivationCodeDto>{};

			await request(app.getHttpServer())
				.post('/auth/resend-activation-code')
				.send(resendActivationCodeDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if email format is incorrect', async (): Promise<void> => {
			const resendActivationCodeDto = <ResendActivationCodeDto>{
				email: 'tony.mail.com',
			};

			await request(app.getHttpServer())
				.post('/auth/resend-activation-code')
				.send(resendActivationCodeDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 404 status if user with given email not exist', async (): Promise<void> => {
			const resendActivationCodeDto = <ResendActivationCodeDto>{
				email: notExistingUserEmail,
			};

			await request(app.getHttpServer())
				.post('/auth/resend-activation-code')
				.send(resendActivationCodeDto)
				.expect(HttpStatus.NOT_FOUND);
		});

		it('should return 422 status if otp code for given user does not exist', async (): Promise<void> => {
			const resendActivationCodeDto = <ResendActivationCodeDto>{
				email: existingUserWithoutOTPCodeEmail,
			};

			await request(app.getHttpServer())
				.post('/auth/resend-activation-code')
				.send(resendActivationCodeDto)
				.expect(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 422 status if user account is already activated', async (): Promise<void> => {
			const resendActivationCodeDto = <ResendActivationCodeDto>{
				email: 'steven@mail.com',
			};

			await request(app.getHttpServer())
				.post('/auth/resend-activation-code')
				.send(resendActivationCodeDto)
				.expect(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 200 status if all data are valid', async (): Promise<void> => {
			const resendActivationCodeDto = <ResendActivationCodeDto>{
				email: existingUserEmail,
			};

			const responseResult = <SuccessfulResponseResult<null>>{
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [],
				dataLength: 0,
			};

			await request(app.getHttpServer())
				.post('/auth/resend-activation-code')
				.send(resendActivationCodeDto)
				.expect(HttpStatus.OK)
				.expect(responseResult);
		});

		it('should return successful response as instance of ResponseResult', async (): Promise<void> => {
			const resendActivationCodeDto = <ResendActivationCodeDto>{
				email: existingUserEmail,
			};

			const responseResult: ResponseResult =
				await authController.resendActivationCode(resendActivationCodeDto);

			expect(responseResult).toBeInstanceOf(ResponseResult);
		});

		it('should call getFullUserByEmail method in users service to find user by email', async (): Promise<void> => {
			const resendActivationCodeDto = <ResendActivationCodeDto>{
				email: existingUserEmail,
			};

			await authController.resendActivationCode(resendActivationCodeDto);

			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledWith(existingUserEmail);
		});

		it('should call createNewOTPCode method in otpCodes service to create new code', async (): Promise<void> => {
			const resendActivationCodeDto = <ResendActivationCodeDto>{
				email: existingUserEmail,
			};

			await authController.resendActivationCode(resendActivationCodeDto);

			expect(otpCodesServiceMock.createNewOTPCode).toHaveBeenCalledTimes(1);
			expect(otpCodesServiceMock.createNewOTPCode).toHaveBeenCalledWith(userOTPCodeId);
		});

		it('should call getUserOTPCode method in users service to get new code', async (): Promise<void> => {
			const resendActivationCodeDto = <ResendActivationCodeDto>{
				email: existingUserEmail,
			};

			await authController.resendActivationCode(resendActivationCodeDto);

			expect(usersServiceMock.getUserOTPCode).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getUserOTPCode).toHaveBeenCalledWith(userOTPCodeId);
		});

		it('should call sendActivationEmail method in email service to send email with code', async (): Promise<void> => {
			const resendActivationCodeDto = <ResendActivationCodeDto>{
				email: existingUserEmail,
			};

			await authController.resendActivationCode(resendActivationCodeDto);

			expect(usersServiceMock.getUserOTPCode).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getUserOTPCode).toHaveBeenCalledWith(userOTPCodeId);
		});
	});
});
