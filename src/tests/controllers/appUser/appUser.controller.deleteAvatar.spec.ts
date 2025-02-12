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
import SpyInstance = jest.SpyInstance;
import { JWTPayloadDto } from 'src/types/dto/JWTTokens/JWTPayload.dto';
import { users } from '@testMocks/User/users';
import { AppUserController } from '@controllers/appUser.controller';
import { User } from '@entities/User.entity';
import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { TUserPayload } from '@custom-types/users/TUserPayload';
import { IUsersService } from '@services/users/IUsersService';
import { UserFullDto } from '../../../types/dto/users/UserFull.dto';
import { FileHelper } from '@helpers/file.helper';
import { AppModule } from '@modules/app.module';
import { AuthModule } from '@modules/auth.module';
import { CustomProviders } from '@enums/CustomProviders.enum';

describe.skip('AppUserController', (): void => {
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

	let deleteFileMock: SpyInstance;

	beforeAll(async (): Promise<void> => {
		deleteFileMock = jest.spyOn(FileHelper, 'deleteFile').mockImplementation(() => {});

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.CTF_USERS_SERVICE)
			.useValue(usersServiceMock)
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

		it('should return nothing', async (): Promise<void> => {
			const result: void = await appUserController.deleteAvatar(appUserPayload);

			expect(result).toBeUndefined();
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
	});
});
