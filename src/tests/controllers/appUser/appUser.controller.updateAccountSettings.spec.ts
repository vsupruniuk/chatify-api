import { Headers } from '@enums/Headers.enum';
import {
	CallHandler,
	ExecutionContext,
	HttpStatus,
	INestApplication,
	UnauthorizedException,
	ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { Observable } from 'rxjs';
import * as request from 'supertest';
import { AppUserController } from '@controllers/appUser/appUser.controller';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { TUserPayload } from '@customTypes/types/users/TUserPayload';
import { IUsersService } from '@services/users/IUsersService';
import { UserFullDto } from '../../../types/dto/users/UserFull.dto';
import { IAccountSettingsService } from '@services/accountSettings/IAccountSettingsService';
import { AppModule } from '@modules/app.module';
import { AuthModule } from '@modules/auth.module';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/UpdateAccountSettingsRequest.dto';

describe.skip('AppUserController', (): void => {
	let app: INestApplication;
	let appUserController: AppUserController;

	let isAuthorized: boolean = false;

	const validToken: string = 'valid-token';
	const invalidToken: string = 'invalid-token';
	const accountSettingsId: string = '1';
	const userId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
	const userAccountSettingsId: string = '1';
	const usersMock: User[] = [...users];
	const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, usersMock[0], {
		excludeExtraneousValues: true,
	});

	const authInterceptorMock: Partial<AuthInterceptor> = {
		async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
			if (!isAuthorized) {
				throw new UnauthorizedException(['Please, login to perform this action']);
			}

			const request: Request & TUserPayload = context.switchToHttp().getRequest();

			request.user = appUserPayload;

			return next.handle();
		},
	};
	const usersServiceMock: Partial<IUsersService> = {
		getFullUserById: jest
			.fn()
			.mockImplementation(async (id: string): Promise<UserFullDto | null> => {
				const user: User | null = usersMock.find((user: User) => user.id === id) || null;

				return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
			}),
	};
	const accountSettingsServiceMock: Partial<IAccountSettingsService> = {
		updateAccountSettings: jest.fn().mockImplementation(async (id: string): Promise<boolean> => {
			return id === accountSettingsId;
		}),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.CTF_USERS_SERVICE)
			.useValue(usersServiceMock)
			.overrideProvider(CustomProviders.CTF_ACCOUNT_SETTINGS_SERVICE)
			.useValue(accountSettingsServiceMock)
			.overrideGuard(AuthInterceptor)
			.useValue(authInterceptorMock)
			.compile();

		app = moduleFixture.createNestApplication();
		appUserController = moduleFixture.get<AppUserController>(AppUserController);

		app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: false }));

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('PATCH /app-user/account-settings', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(appUserController.updateUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(appUserController.updateUser).toBeInstanceOf(Function);
		});

		it('should return 401 status if authorization header is not passed', async (): Promise<void> => {
			await request(app.getHttpServer())
				.patch('/app-user/account-settings')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token not passed to authorization header', async (): Promise<void> => {
			await request(app.getHttpServer())
				.patch('/app-user/account-settings')
				.set(Headers.AUTHORIZATION, 'Bearer')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token invalid', async (): Promise<void> => {
			await request(app.getHttpServer())
				.patch('/app-user/account-settings')
				.set(Headers.AUTHORIZATION, `Bearer ${invalidToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 400 status if body is not passed to request', async (): Promise<void> => {
			isAuthorized = true;

			await request(app.getHttpServer())
				.patch('/app-user/account-settings')
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if empty body is passed to request', async (): Promise<void> => {
			isAuthorized = true;

			await request(app.getHttpServer())
				.patch('/app-user/account-settings')
				.send({})
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if twoStepVerification present in body but it is not a boolean value', async (): Promise<void> => {
			isAuthorized = true;

			const updateAccountSettingsDto = {
				twoStepVerification: 's',
			};

			await request(app.getHttpServer())
				.patch('/app-user/account-settings')
				.send(updateAccountSettingsDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if notification present in body but it is not a boolean value', async (): Promise<void> => {
			isAuthorized = true;

			const updateAccountSettingsDto = {
				notification: 's',
			};

			await request(app.getHttpServer())
				.patch('/app-user/account-settings')
				.send(updateAccountSettingsDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if enterIsSend present in body but it is not a boolean value', async (): Promise<void> => {
			isAuthorized = true;

			const updateAccountSettingsDto = {
				enterIsSend: 's',
			};

			await request(app.getHttpServer())
				.patch('/app-user/account-settings')
				.send(updateAccountSettingsDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 200 status if all data valid', async (): Promise<void> => {
			isAuthorized = true;

			const updateAccountSettingsDto: UpdateAccountSettingsRequestDto = {
				enterIsSend: false,
				notification: true,
				twoStepVerification: true,
			};

			await request(app.getHttpServer())
				.patch('/app-user/account-settings')
				.send(updateAccountSettingsDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.OK);
		});

		it('should return nothing', async (): Promise<void> => {
			const updateAccountSettingsDto: UpdateAccountSettingsRequestDto = {
				enterIsSend: false,
				notification: true,
				twoStepVerification: true,
			};

			const result: void = await appUserController.updateAccountSettings(
				appUserPayload,
				updateAccountSettingsDto,
			);

			expect(result).toBeUndefined();
		});

		it('should call getFullUserById method in users service to get full user data', async (): Promise<void> => {
			const updateAccountSettingsDto: UpdateAccountSettingsRequestDto = {
				enterIsSend: false,
				notification: true,
				twoStepVerification: true,
			};

			await appUserController.updateAccountSettings(appUserPayload, updateAccountSettingsDto);

			expect(usersServiceMock.getFullUserById).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getFullUserById).toHaveBeenCalledWith(userId);
		});

		it('should call updateAccountSettings method in account settings service to update user account settings', async (): Promise<void> => {
			const updateAccountSettingsDto: UpdateAccountSettingsRequestDto = {
				enterIsSend: false,
				notification: true,
				twoStepVerification: true,
			};

			await appUserController.updateAccountSettings(appUserPayload, updateAccountSettingsDto);

			expect(accountSettingsServiceMock.updateAccountSettings).toHaveBeenCalledTimes(1);
			expect(accountSettingsServiceMock.updateAccountSettings).toHaveBeenCalledWith(
				userAccountSettingsId,
				updateAccountSettingsDto,
			);
		});
	});
});
