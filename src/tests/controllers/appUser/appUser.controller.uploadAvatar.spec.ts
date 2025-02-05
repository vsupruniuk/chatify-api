import { AppUserController } from '@Controllers/appUser.controller';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { User } from '@Entities/User.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Headers } from '@Enums/Headers.enum';
import { FileHelper } from '@Helpers/file.helper';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
import {
	HttpStatus,
	INestApplication,
	UnauthorizedException,
	ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { users } from '@TestMocks/User/users';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import * as request from 'supertest';
import SpyInstance = jest.SpyInstance;

describe('AppUserController', (): void => {
	let app: INestApplication;
	let appUserController: AppUserController;

	let userWithAvatar: boolean = false;

	const invalidToken: string = 'invalid-token';
	const userId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
	const usersMock: User[] = [...users];
	const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, usersMock[0], {
		excludeExtraneousValues: true,
	});

	const authInterceptorMock: Partial<AuthInterceptor> = {
		async intercept(): Promise<Observable<unknown>> {
			throw new UnauthorizedException(['Please, login to perform this action']);
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

	const fileMock = {
		fieldname: 'user-avatar',
		originalname: 'user-avatar.png',
		encoding: '7bit',
		mimetype: 'image/png',
		destination: 'public',
		filename: 'f46845d7-90af-4c29-8e1a-227c90b33852.png',
		path: 'public/f46845d7-90af-4c29-8e1a-227c90b33852-1712088543513.png',
		size: 54707,
	} as Express.Multer.File;

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

	describe('POST /app-user/user-avatar', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(appUserController.uploadAvatar).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(appUserController.uploadAvatar).toBeInstanceOf(Function);
		});

		it('should return 401 status if authorization header is not passed', async (): Promise<void> => {
			await request(app.getHttpServer())
				.post('/app-user/user-avatar')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token not passed to authorization header', async (): Promise<void> => {
			await request(app.getHttpServer())
				.post('/app-user/user-avatar')
				.set(Headers.AUTHORIZATION, 'Bearer')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token invalid', async (): Promise<void> => {
			await request(app.getHttpServer())
				.post('/app-user/user-avatar')
				.set(Headers.AUTHORIZATION, `Bearer ${invalidToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await appUserController.uploadAvatar(appUserPayload, fileMock);

			expect(result).toBeUndefined();
		});

		it('should call getFullUserById method in users service to get full user information', async (): Promise<void> => {
			await appUserController.uploadAvatar(appUserPayload, fileMock);

			expect(usersServiceMock.getFullUserById).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getFullUserById).toHaveBeenCalledWith(userId);
		});

		it('should call updateUser method in users service to update user avatar url', async (): Promise<void> => {
			await appUserController.uploadAvatar(appUserPayload, fileMock);

			expect(usersServiceMock.updateUser).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.updateUser).toHaveBeenCalledWith(userId, {
				avatarUrl: fileMock.filename,
			});
		});

		it('should not to call deleteFile method from FileHelper if user does not have avatar', async (): Promise<void> => {
			await appUserController.uploadAvatar(appUserPayload, fileMock);

			expect(deleteFileMock).not.toHaveBeenCalled();
		});

		it('should call deleteFile method from FileHelper if user already have avatar', async (): Promise<void> => {
			userWithAvatar = true;

			const user: UserFullDto | null = await usersServiceMock.getFullUserById!(userId);

			await appUserController.uploadAvatar(appUserPayload, fileMock);

			expect(deleteFileMock).toHaveBeenCalledTimes(1);
			expect(deleteFileMock).toHaveBeenCalledWith(user?.avatarUrl);
		});
	});
});
