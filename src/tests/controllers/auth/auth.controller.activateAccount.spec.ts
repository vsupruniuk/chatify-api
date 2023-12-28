import { AuthController } from '@Controllers/auth.controller';
import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { OTPCode } from '@Entities/OTPCode.entity';
import { User } from '@Entities/User.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { otpCodes } from '@TestMocks/OTPCode/otpCodes';
import { users } from '@TestMocks/User/users';
import * as request from 'supertest';

describe('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const otpCodesMock: OTPCode[] = [...otpCodes];
	let usersMock: User[] = [...users];

	const authServiceMock: IAuthService = {
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

				const userIndex = usersMock.findIndex((user: User) => user.id === accountActivationDto.id);

				if (userIndex < 0) {
					return false;
				} else {
					usersMock[userIndex].isActivated = true;

					return true;
				}
			}),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.I_AUTH_SERVICE)
			.useValue(authServiceMock)
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
			jest.useRealTimers();
		});

		it('should return 400 status if id format is incorrect', (): Test => {
			const accountActivationDto = <AccountActivationDto>{
				id: 'uuid-4',
				code: 111111,
				OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd098',
			};

			return request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if OTPCodeId format is incorrect', (): Test => {
			const accountActivationDto = <AccountActivationDto>{
				id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
				code: 111111,
				OTPCodeId: 'uuid-4',
			};

			return request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if code is not a number', (): Test => {
			const accountActivationDto = {
				id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
				code: 'string',
				OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd099',
			};

			return request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if code less then 100 000 (not a 6-digit number)', (): Test => {
			const accountActivationDto = <AccountActivationDto>{
				id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
				code: 98765,
				OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd099',
			};

			return request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if code greater then 999 999 (not a 6-digit number)', (): Test => {
			const accountActivationDto = <AccountActivationDto>{
				id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
				code: 1234567,
				OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd099',
			};

			return request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if OTPCodeId does not exist', (): Test => {
			const accountActivationDto = <AccountActivationDto>{
				id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
				code: 123456,
				OTPCodeId: '1162843c-4d4b-4124-ac31-45549dedd099',
			};

			return request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if code is expired', (): Test => {
			jest.setSystemTime(new Date('2023-11-24 18:35:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
				code: 123456,
				OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd099',
			};

			return request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if code is wrong', (): Test => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
				code: 444444,
				OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd099',
			};

			return request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if user id does not exist', (): Test => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: 'f46845d7-90af-4c29-8e1a-227c90b33853',
				code: 111111,
				OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd099',
			};

			return request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 200 status and correct response if all data is valid', (): Test => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
				code: 111111,
				OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd099',
			};

			const expectedResponse = <SuccessfulResponseResult<null>>{
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [],
				dataLength: 0,
			};

			return request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.OK)
				.expect(expectedResponse);
		});

		it('should call activateAccount method in auth controller to handle account activation', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
				code: 111111,
				OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd099',
			};

			await authController.activateAccount(accountActivationDto);

			expect(authServiceMock.activateAccount).toHaveBeenCalledWith(accountActivationDto);
		});

		it('should return response as instance of SuccessfulResponseResult', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
				code: 111111,
				OTPCodeId: '1662043c-4d4b-4424-ac31-45189dedd099',
			};

			const response: ResponseResult = await authController.activateAccount(accountActivationDto);

			expect(response).toBeInstanceOf(SuccessfulResponseResult);
		});
	});
});
