import { AuthController } from '@Controllers/auth.controller';
import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { UpdateOTPCodeDto } from '@DTO/OTPCodes/UpdateOTPCode.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { OTPCode } from '@Entities/OTPCode.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { IOTPCodesService } from '@Interfaces/OTPCodes/IOTPCodesService';
import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { otpCodes } from '@TestMocks/OTPCode/otpCodes';
import { users } from '@TestMocks/UserFullDto/users';
import * as request from 'supertest';

describe('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const otpCodesMock: OTPCode[] = [...otpCodes];
	let usersMock: UserFullDto[] = [...users];

	const existingOTPCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd099';
	const notExistingOTPCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd000';
	const existingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
	const notExistingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33333';

	const authServiceMock: Partial<IAuthService> = {
		activateAccount: jest
			.fn()
			.mockImplementation(async (accountActivationDto: AccountActivationDto): Promise<boolean> => {
				const otpCode: OTPCode | undefined = otpCodesMock.find(
					(code: OTPCode) => code.id === accountActivationDto.OTPCodeId,
				);

				if (!otpCode) {
					return false;
				}

				const isExpired = OTPCodesHelper.isExpired(otpCode);

				if (isExpired) {
					return false;
				}

				if (accountActivationDto.code !== otpCode.code) {
					return false;
				}

				const userIndex = usersMock.findIndex(
					(user: UserFullDto) => user.id === accountActivationDto.id,
				);

				if (userIndex < 0) {
					return false;
				} else {
					usersMock[userIndex].isActivated = true;

					return true;
				}
			}),
	};

	const otpCodesServiceMock: Partial<IOTPCodesService> = {
		updateOTPCode: jest.fn().mockImplementation(async (userOTPCodeId: string): Promise<boolean> => {
			return otpCodesMock.some((code: OTPCode) => code.id === userOTPCodeId);
		}),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.I_AUTH_SERVICE)
			.useValue(authServiceMock)
			.overrideProvider(CustomProviders.I_OTP_CODES_SERVICE)
			.useValue(otpCodesServiceMock)
			.compile();

		app = moduleFixture.createNestApplication();
		authController = moduleFixture.get<AuthController>(AuthController);

		app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: false }));

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('POST /auth/activate-account', (): void => {
		beforeEach((): void => {
			usersMock = [...users];

			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.useRealTimers();
		});

		it('should be defined', (): void => {
			expect(authController.activateAccount).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.activateAccount).toBeInstanceOf(Function);
		});

		it('should return 400 status if id format is incorrect', async (): Promise<void> => {
			const accountActivationDto = <AccountActivationDto>{
				id: 'uuid-4',
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if OTPCodeId format is incorrect', async (): Promise<void> => {
			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: 'uuid-4',
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if code is not a number', async (): Promise<void> => {
			const accountActivationDto = {
				id: existingUserId,
				code: 'string',
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if code less then 100 000 (not a 6-digit number)', async (): Promise<void> => {
			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 98765,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if code greater then 999 999 (not a 6-digit number)', async (): Promise<void> => {
			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 1234567,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 422 status if OTPCodeId does not exist', async (): Promise<void> => {
			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 123456,
				OTPCodeId: notExistingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 422 status if code is expired', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:35:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 123456,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 422 status if code is wrong', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 444444,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 422 status if user id does not exist', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: notExistingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 200 status and correct response if all data is valid', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			const expectedResponse = <SuccessfulResponseResult<null>>{
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [],
				dataLength: 0,
			};

			request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.OK)
				.expect(expectedResponse);
		});

		it('should call activateAccount method in auth controller to handle account activation', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			await authController.activateAccount(accountActivationDto);

			expect(authServiceMock.activateAccount).toHaveBeenCalledTimes(1);
			expect(authServiceMock.activateAccount).toHaveBeenCalledWith(accountActivationDto);
		});

		it('should call updateOTPCode method in otpCodes service to update opt code after account activation', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			const updateOTPCodeDto: UpdateOTPCodeDto = {
				code: null,
				expiresAt: null,
			};

			await authController.activateAccount(accountActivationDto);

			expect(otpCodesServiceMock.updateOTPCode).toHaveBeenCalledTimes(1);
			expect(otpCodesServiceMock.updateOTPCode).toHaveBeenCalledWith(
				existingOTPCodeId,
				updateOTPCodeDto,
			);
		});

		it('should return response as instance of SuccessfulResponseResult', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			const response: ResponseResult = await authController.activateAccount(accountActivationDto);

			expect(response).toBeInstanceOf(SuccessfulResponseResult);
		});
	});
});
