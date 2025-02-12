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
import { User } from '@entities/User.entity';
import { AppUserController } from '@controllers/appUser.controller';
import { users } from '@testMocks/User/users';
import { JWTPayloadDto } from '../../../types/dto/JWTTokens/JWTPayload.dto';
import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { TUserPayload } from '@custom-types/users/TUserPayload';
import { IUsersService } from '@services/users/IUsersService';
import { AppUserDto } from '../../../types/dto/appUser/appUser.dto';
import { AppModule } from '@modules/app.module';
import { AuthModule } from '@modules/auth.module';
import { CustomProviders } from '@enums/CustomProviders.enum';

describe.skip('AppUserController', (): void => {
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

			await request(app.getHttpServer())
				.get('/app-user')
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.OK);
		});

		it('should return response as instance of AppUserDto', async (): Promise<void> => {
			const response: AppUserDto = await appUserController.getUser(appUserPayload);

			expect(response).toBeInstanceOf(AppUserDto);
		});

		it('should call getAppUser from users service to get user', async (): Promise<void> => {
			await appUserController.getUser(appUserPayload);

			expect(usersServiceMock.getAppUser).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getAppUser).toHaveBeenCalledWith(userId);
		});
	});
});
