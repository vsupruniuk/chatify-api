import { AppUserController } from '@Controllers/appUser.controller';
import { UpdateAppUserDto } from '@DTO/appUser/UpdateAppUser.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { User } from '@Entities/User.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Headers } from '@Enums/Headers.enum';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
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

		getByNickname: jest
			.fn()
			.mockImplementation(async (nickname: string): Promise<UserShortDto | null> => {
				const user: User | null =
					usersMock.find((user: User) => user.nickname === nickname) || null;

				return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
			}),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.I_USERS_SERVICE)
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

	describe('PATCH /app-user', (): void => {
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
			await request(app.getHttpServer()).patch('/app-user').expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token not passed to authorization header', async (): Promise<void> => {
			await request(app.getHttpServer())
				.patch('/app-user')
				.set(Headers.AUTHORIZATION, 'Bearer')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token invalid', async (): Promise<void> => {
			await request(app.getHttpServer())
				.patch('/app-user')
				.set(Headers.AUTHORIZATION, `Bearer ${invalidToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 400 status if body is not passed to request', async (): Promise<void> => {
			isAuthorized = true;

			await request(app.getHttpServer())
				.patch('/app-user')
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if empty body is passed to request', async (): Promise<void> => {
			isAuthorized = true;

			await request(app.getHttpServer())
				.patch('/app-user')
				.send({})
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if about present in body, but its not a string', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto = {
				about: 1,
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if about present in body, but its too long', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto: UpdateAppUserDto = {
				about: 'Iron man'.padEnd(256, 'n'),
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if firstName present in body, but its not a string', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto = {
				firstName: 1,
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if firstName present in body, but its too short', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto: UpdateAppUserDto = {
				firstName: 'To',
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if firstName present in body, but its too long', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto: UpdateAppUserDto = {
				firstName: 'Tony'.padEnd(256, 'y'),
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if lastName present in body, but its not a string', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto = {
				lastName: 1,
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if lastName present in body, but its too short', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto: UpdateAppUserDto = {
				lastName: 'St',
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if lastName present in body, but its too long', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto: UpdateAppUserDto = {
				lastName: 'Stark'.padEnd(256, 'k'),
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if nickname present in body, but its not a string', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto = {
				nickname: 1,
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if nickname present in body, but its too short', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto: UpdateAppUserDto = {
				nickname: 'st',
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if nickname present in body, but its too long', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto: UpdateAppUserDto = {
				nickname: 't.stark'.padEnd(256, 'k'),
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 409 status if nickname present in body, but its already taken', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto: UpdateAppUserDto = {
				nickname: 't.stark',
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.CONFLICT);
		});

		it('should return 200 status if all data valid', async (): Promise<void> => {
			isAuthorized = true;

			const updateAppUserDto: UpdateAppUserDto = {
				about: 'Iron man',
				firstName: 'Tony',
				lastName: 'Stark',
				nickname: 'tony.stark',
			};

			await request(app.getHttpServer())
				.patch('/app-user')
				.send(updateAppUserDto)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.OK);
		});

		it('should return result as instance of Response Result', async (): Promise<void> => {
			const updateAppUserDto: UpdateAppUserDto = {
				about: 'Iron man',
				firstName: 'Tony',
				lastName: 'Stark',
				nickname: 'tony.stark',
			};

			const result: ResponseResult = await appUserController.updateUser(
				appUserPayload,
				updateAppUserDto,
			);

			expect(result).toBeInstanceOf(ResponseResult);
		});

		it('should call getByNickname in users service to check if user with given nickname already exist', async (): Promise<void> => {
			const updateAppUserDto: UpdateAppUserDto = {
				about: 'Iron man',
				firstName: 'Tony',
				lastName: 'Stark',
				nickname: 'tony.stark',
			};

			await appUserController.updateUser(appUserPayload, updateAppUserDto);

			expect(usersServiceMock.getByNickname).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getByNickname).toHaveBeenCalledWith(updateAppUserDto.nickname);
		});

		it('should not to call getByNickname in users service if nickname was not passed to body', async (): Promise<void> => {
			const updateAppUserDto: UpdateAppUserDto = {
				about: 'Iron man',
				firstName: 'Tony',
				lastName: 'Stark',
			};

			await appUserController.updateUser(appUserPayload, updateAppUserDto);

			expect(usersServiceMock.getByNickname).not.toHaveBeenCalled();
		});

		it('should call updateUser method in users service to update user', async (): Promise<void> => {
			const updateAppUserDto: UpdateAppUserDto = {
				about: 'Iron man',
				firstName: 'Tony',
				lastName: 'Stark',
				nickname: 'tony.stark',
			};

			await appUserController.updateUser(appUserPayload, updateAppUserDto);

			expect(usersServiceMock.updateUser).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.updateUser).toHaveBeenCalledWith(userId, updateAppUserDto);
		});
	});
});
