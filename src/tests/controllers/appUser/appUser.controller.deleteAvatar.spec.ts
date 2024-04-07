import { AppUserController } from '@Controllers/appUser.controller';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { User } from '@Entities/User.entity';
import { CacheKeys } from '@Enums/CacheKeys.enum';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Headers } from '@Enums/Headers.enum';
import { FileHelper } from '@Helpers/file.helper';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
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
import SpyInstance = jest.SpyInstance;

describe('AppUserController', (): void => {
	let app: INestApplication;
	let appUserController: AppUserController;

	let userWithAvatar: boolean = false;
	let isAuthorized: boolean = false;

	const validToken: string = 'valid-token';
	const invalidToken: string = 'invalid-token';
	const userId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
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
		updateUser: jest.fn().mockImplementation(async (id: string): Promise<boolean> => {
			return id === userId;
		}),

		getFullUserById: jest
			.fn()
			.mockImplementation(async (id: string): Promise<UserFullDto | null> => {
				const user: User | null = usersMock.find((user: User) => user.id === id) || null;

				return user
					? plainToInstance(
							UserFullDto,
							userWithAvatar
								? { ...user, avatarUrl: 'f46845d7-90af-4c29-8e1a-227c90b33852.png' }
								: user,
							{ excludeExtraneousValues: true },
						)
					: null;
			}),
	};

	const cacheMock: Partial<Cache> = {
		del: jest.fn(),
	};

	let deleteFileMock: SpyInstance;

	beforeAll(async (): Promise<void> => {
		deleteFileMock = jest.spyOn(FileHelper, 'deleteFile').mockImplementation(() => {});

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.I_USERS_SERVICE)
			.useValue(usersServiceMock)
			.overrideProvider(CACHE_MANAGER)
			.useValue(cacheMock)
			.overrideInterceptor(AuthInterceptor)
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

	describe('DELETE /app-user/user-avatar', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(appUserController.deleteAvatar).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(appUserController.deleteAvatar).toBeInstanceOf(Function);
		});

		it('should return 401 status if authorization header is not passed', async (): Promise<void> => {
			await request(app.getHttpServer())
				.del('/app-user/user-avatar')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token not passed to authorization header', async (): Promise<void> => {
			await request(app.getHttpServer())
				.del('/app-user/user-avatar')
				.set(Headers.AUTHORIZATION, 'Bearer')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token invalid', async (): Promise<void> => {
			await request(app.getHttpServer())
				.del('/app-user/user-avatar')
				.set(Headers.AUTHORIZATION, `Bearer ${invalidToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 404 status if user does not have avatar', async (): Promise<void> => {
			isAuthorized = true;

			await request(app.getHttpServer())
				.del('/app-user/user-avatar')
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.NOT_FOUND);
		});

		it('should return 204 status if user avatar was deleted', async (): Promise<void> => {
			isAuthorized = true;
			userWithAvatar = true;

			await request(app.getHttpServer())
				.del('/app-user/user-avatar')
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.NO_CONTENT);
		});

		it('should return response as instance of ResponseResult', async (): Promise<void> => {
			const result: ResponseResult = await appUserController.deleteAvatar(appUserPayload);

			expect(result).toBeInstanceOf(ResponseResult);
		});

		it('should call getFullUserById in users service to get full user', async (): Promise<void> => {
			await appUserController.deleteAvatar(appUserPayload);

			expect(usersServiceMock.getFullUserById).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getFullUserById).toHaveBeenCalledWith(userId);
		});

		it('should call deleteFile in files helper to delete user avatar', async (): Promise<void> => {
			userWithAvatar = true;

			const user: UserFullDto | null = await usersServiceMock.getFullUserById!(userId);

			await appUserController.deleteAvatar(appUserPayload);

			expect(deleteFileMock).toHaveBeenCalledTimes(1);
			expect(deleteFileMock).toHaveBeenCalledWith(user?.avatarUrl);
		});

		it('should call updateUser in users service to set avatar url to null', async (): Promise<void> => {
			userWithAvatar = true;

			await appUserController.deleteAvatar(appUserPayload);

			expect(usersServiceMock.updateUser).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.updateUser).toHaveBeenCalledWith(userId, { avatarUrl: null });
		});

		it('should call del method in cache service to delete cached user data', async (): Promise<void> => {
			await appUserController.deleteAvatar(appUserPayload);

			expect(cacheMock.del).toHaveBeenCalledTimes(1);
			expect(cacheMock.del).toHaveBeenCalledWith(CacheKeys.APP_USER + `_${userId}`);
		});
	});
});
