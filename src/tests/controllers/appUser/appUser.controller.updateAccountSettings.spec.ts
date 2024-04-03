import { AppUserController } from '@Controllers/appUser.controller';
import { UpdateAccountSettingsDto } from '@DTO/accountSettings/updateAccountSettings.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { User } from '@Entities/User.entity';
import { CacheKeys } from '@Enums/CacheKeys.enum';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Headers } from '@Enums/Headers.enum';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { IAccountSettingsService } from '@Interfaces/accountSettings/IAccountSettingsService';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
	CallHandler,
	ExecutionContext,
	HttpStatus,
	INestApplication,
	UnauthorizedException,
	ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResponseResult } from '@Responses/ResponseResult';
import { users } from '@TestMocks/User/users';
import { TUserPayload } from '@Types/users/TUserPayload';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { Observable } from 'rxjs';
import * as request from 'supertest';

describe('AppUserController', (): void => {
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
	const cacheMock: Partial<Cache> = {
		del: jest.fn(),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.I_USERS_SERVICE)
			.useValue(usersServiceMock)
			.overrideProvider(CustomProviders.I_ACCOUNT_SETTINGS_SERVICE)
			.useValue(accountSettingsServiceMock)
			.overrideProvider(CACHE_MANAGER)
			.useValue(cacheMock)
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

			const updateAccountSettingsDto: UpdateAccountSettingsDto = {
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

		it('should return result as instance of Response Result', async (): Promise<void> => {
			const updateAccountSettingsDto: UpdateAccountSettingsDto = {
				enterIsSend: false,
				notification: true,
				twoStepVerification: true,
			};

			const result: ResponseResult = await appUserController.updateAccountSettings(
				appUserPayload,
				updateAccountSettingsDto,
			);

			expect(result).toBeInstanceOf(ResponseResult);
		});

		it('should call getFullUserById method in users service to get full user data', async (): Promise<void> => {
			const updateAccountSettingsDto: UpdateAccountSettingsDto = {
				enterIsSend: false,
				notification: true,
				twoStepVerification: true,
			};

			await appUserController.updateAccountSettings(appUserPayload, updateAccountSettingsDto);

			expect(usersServiceMock.getFullUserById).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getFullUserById).toHaveBeenCalledWith(userId);
		});

		it('should call updateAccountSettings method in account settings service to update user account settings', async (): Promise<void> => {
			const updateAccountSettingsDto: UpdateAccountSettingsDto = {
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

		it('should call del method in cache service to delete cached user data', async (): Promise<void> => {
			const updateAccountSettingsDto: UpdateAccountSettingsDto = {
				enterIsSend: false,
				notification: true,
				twoStepVerification: true,
			};

			await appUserController.updateAccountSettings(appUserPayload, updateAccountSettingsDto);

			expect(cacheMock.del).toHaveBeenCalledTimes(1);
			expect(cacheMock.del).toHaveBeenCalledWith(CacheKeys.APP_USER + `_${userId}`);
		});
	});
});
