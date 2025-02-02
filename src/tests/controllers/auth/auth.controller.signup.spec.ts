import { IEmailService } from '@Interfaces/emails/IEmailService';
import { IOTPCodesService } from '@Interfaces/OTPCodes/IOTPCodesService';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import * as request from 'supertest';
import { plainToInstance } from 'class-transformer';

import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';

import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { ResponseResult } from '@Responses/ResponseResult';

import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
import { AuthController } from '@Controllers/auth.controller';

describe('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const usersMock: UserShortDto[] = [];
	const otpCode: OTPCodeResponseDto = { code: 111111, expiresAt: '2023-11-25 1:10:00' };

	const usersServiceMock: Partial<IUsersService> = {
		getByEmailOrNickname: jest
			.fn()
			.mockImplementation(async (email: string, nickname: string): Promise<UserShortDto | null> => {
				return (
					usersMock.find(
						(user: UserShortDto) => user.email === email || user.nickname === nickname,
					) || null
				);
			}),

		createUser: jest
			.fn()
			.mockImplementation(async (signupUserDto: SignupUserDto): Promise<UserShortDto> => {
				const user = plainToInstance(
					UserShortDto,
					<UserShortDto>{
						...signupUserDto,
						id: '4',
						about: null,
						avatarUrl: null,
						accountSettings: { id: '01' },
						OTPCode: { id: '001' },
					},
					{ excludeExtraneousValues: true },
				);

				usersMock.push(user);

				return user;
			}),
	};

	const otpCodesServiceMock: Partial<IOTPCodesService> = {
		getUserOTPCode: jest.fn().mockImplementation((): OTPCodeResponseDto => {
			return otpCode;
		}),
	};

	const emailServiceMock: Partial<IEmailService> = {
		sendActivationEmail: jest
			.fn()
			.mockImplementation(async (receiverEmail: string, otpCode: number): Promise<string> => {
				return `${receiverEmail}, ${otpCode}`;
			}),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.I_USERS_SERVICE)
			.useValue(usersServiceMock)
			.overrideProvider(CustomProviders.I_EMAIL_SERVICE)
			.useValue(emailServiceMock)
			.overrideProvider(CustomProviders.I_OTP_CODES_SERVICE)
			.useValue(otpCodesServiceMock)
			.compile();

		app = moduleFixture.createNestApplication();
		authController = moduleFixture.get<AuthController>(AuthController);

		app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('POST /auth/signup', (): void => {
		beforeEach((): void => {
			usersMock.length = 0;
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(authController.signup).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.signup).toBeInstanceOf(Function);
		});

		it('should return 400 status if email is missing', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if email is incorrect', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce.mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if email is too long', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com'.padStart(256, 'b'),
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 409 status if email is already taken', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			usersServiceMock.createUser?.(user);

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.CONFLICT);
		});

		it('should return 400 status if firstName is not a string', async (): Promise<void> => {
			const user = {
				firstName: 2,
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if firstName is too short', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Br',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if firstName is too long', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce'.padStart(256, 'B'),
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if lastName is present but too short', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Ba',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if lastName is present but too long', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner'.padStart(256, 'B'),
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 409 status if nickname is already taken', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			usersServiceMock.createUser?.(user);

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.CONFLICT);
		});

		it('should return 400 status if nickname is too short', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'bb',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if nickname is too long', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner'.padStart(256, 'b'),
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password is not a string', async (): Promise<void> => {
			const user = {
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 2,
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password is too short', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwert',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password is too long', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A'.padStart(256, 'q'),
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password not contains at least 1 number', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwertyA',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password not contains at least 1 uppercase letter', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1',
				passwordConfirmation: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password confirmation is not a string', async (): Promise<void> => {
			const user = {
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 2,
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password confirmation is too short', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwert',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password confirmation is too long', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A'.padStart(256, 'q'),
				passwordConfirmation: 'qwerty1A'.padStart(256, 'q'),
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password confirmation not contains at least 1 number', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwertyA',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password confirmation not contains at least 1 uppercase letter', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password and password confirmation not matching', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1AA',
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 201 status and user data', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			const responseResult = <SuccessfulResponseResult<UserShortDto>>{
				code: HttpStatus.CREATED,
				status: ResponseStatus.SUCCESS,
				data: [
					{
						id: '4',
						firstName: 'Bruce',
						lastName: 'Banner',
						email: 'bruce@mail.com',
						nickname: 'b.banner',
						about: null,
						avatarUrl: null,
						accountSettings: { id: '01' },
						OTPCode: { id: '001' },
					},
				],
				dataLength: 1,
			};

			await request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.CREATED)
				.expect(responseResult);
		});

		it('should call getByEmailOrNickname method in users service to check if user with provided email or nickname exist', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await authController.signup(user);

			expect(usersServiceMock.getByEmailOrNickname).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getByEmailOrNickname).toHaveBeenCalledWith(user.email, user.nickname);
		});

		it('should call createUser in users service to create user', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await authController.signup(user);

			expect(usersServiceMock.createUser).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.createUser).toHaveBeenCalledWith(user);
		});

		it('should call getUserOTPCode in otpCodes service to get user OTP code', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await authController.signup(user);

			expect(otpCodesServiceMock.getUserOTPCode).toHaveBeenCalledTimes(1);
		});

		it('should call sendActivationEmail in email service to send email with OTP code', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			await authController.signup(user);

			expect(emailServiceMock.sendActivationEmail).toHaveBeenCalledTimes(1);
			expect(emailServiceMock.sendActivationEmail).toHaveBeenCalledWith(user.email, otpCode.code);
		});

		it('should return response as instance of SuccessfulResponseResult', async (): Promise<void> => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			const response: ResponseResult = await authController.signup(user);

			expect(response).toBeInstanceOf(SuccessfulResponseResult);
		});
	});
});
