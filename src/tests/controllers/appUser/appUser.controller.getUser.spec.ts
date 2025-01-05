import { AppUserController } from '@Controllers/appUser.controller';
import { AppUserDto } from '@DTO/appUser/appUser.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { User } from '@Entities/User.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Headers } from '@Enums/Headers.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
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
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
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
		getAppUser: jest.fn().mockImplementation(async (id: string): Promise<AppUserDto | null> => {
			const user: AppUserDto | null = usersMock.find((user: User) => user.id === id) || null;

			return user ? plainToInstance(AppUserDto, user, { excludeExtraneousValues: true }) : null;
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

	describe('GET /app-user', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(appUserController.getUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(appUserController.getUser).toBeInstanceOf(Function);
		});

		it('should return 401 status if authorization header is not passed', async (): Promise<void> => {
			await request(app.getHttpServer()).get('/app-user').expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token not passed to authorization header', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get('/app-user')
				.set(Headers.AUTHORIZATION, 'Bearer')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token invalid', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get('/app-user')
				.set(Headers.AUTHORIZATION, `Bearer ${invalidToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 200 status and current authorized user if access token valid', async (): Promise<void> => {
			isAuthorized = true;

			const responseResult = <SuccessfulResponseResult<AppUserDto>>{
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [
					{
						id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
						about: null,
						avatarUrl: null,
						firstName: 'Tony',
						lastName: 'Stark',
						nickname: 't.stark',
						accountSettings: {
							id: '1',
							enterIsSend: false,
							notification: false,
							twoStepVerification: true,
						},
					},
				],
				dataLength: 1,
			};

			await request(app.getHttpServer())
				.get('/app-user')
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.OK)
				.expect(responseResult);
		});

		it('should return response as instance of ResponseResult', async (): Promise<void> => {
			const response: ResponseResult = await appUserController.getUser(appUserPayload);

			expect(response).toBeInstanceOf(ResponseResult);
		});

		it('should call getAppUser from users service to get user', async (): Promise<void> => {
			await appUserController.getUser(appUserPayload);

			expect(usersServiceMock.getAppUser).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getAppUser).toHaveBeenCalledWith(userId);
		});
	});
});
