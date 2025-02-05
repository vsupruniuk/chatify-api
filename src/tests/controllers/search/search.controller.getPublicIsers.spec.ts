import { SearchController } from '@Controllers/search.controller';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';
import { User } from '@Entities/User.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Headers } from '@Enums/Headers.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppModule } from '@Modules/app.module';
import { SearchModule } from '@Modules/search.module';
import {
	CallHandler,
	ExecutionContext,
	HttpStatus,
	INestApplication,
	UnauthorizedException,
	ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { users } from '@TestMocks/User/users';
import { TUserPayload } from '@Types/users/TUserPayload';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { Observable } from 'rxjs';
import * as request from 'supertest';

describe('SearchController', (): void => {
	let app: INestApplication;
	let searchController: SearchController;

	let isAuthorized: boolean = false;

	const validToken: string = 'valid-token';
	const invalidToken: string = 'invalid-token';
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
		getPublicUsers: jest
			.fn()
			.mockImplementation(
				async (
					userNickName: string,
					nickname: string,
					page: number = 1,
					take: number = 10,
				): Promise<UserPublicDto[]> => {
					return usersMock
						.filter(
							(user: User) =>
								user.nickname.toLowerCase().includes(nickname.toLowerCase()) &&
								user.nickname !== userNickName &&
								user.isActivated,
						)
						.slice(page * take - take, take)
						.map((user: User) =>
							plainToInstance(UserPublicDto, user, { excludeExtraneousValues: true }),
						);
				},
			),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, SearchModule],
		})
			.overrideProvider(CustomProviders.CTF_USERS_SERVICE)
			.useValue(usersServiceMock)
			.overrideInterceptor(AuthInterceptor)
			.useValue(authInterceptorMock)
			.compile();

		app = moduleFixture.createNestApplication();
		searchController = moduleFixture.get<SearchController>(SearchController);

		app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: false }));

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('GET /search/find-users', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(searchController.findUsers).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(searchController.findUsers).toBeInstanceOf(Function);
		});

		it('should return 401 status if authorization header is not passed', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get('/search/find-users')
				.query({ nickname: 't.stark' })
				.query({ page: 1 })
				.query({ take: 10 })
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token not passed to authorization header', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get('/search/find-users')
				.query({ nickname: 't.stark' })
				.query({ page: 1 })
				.query({ take: 10 })
				.set(Headers.AUTHORIZATION, 'Bearer')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token invalid', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get('/search/find-users')
				.query({ nickname: 't.stark' })
				.query({ page: 1 })
				.query({ take: 10 })
				.set(Headers.AUTHORIZATION, `Bearer ${invalidToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 400 status if nickname is not provided in query', async (): Promise<void> => {
			isAuthorized = true;

			await request(app.getHttpServer())
				.get('/search/find-users')
				.query({ page: 1 })
				.query({ take: 10 })
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 200 status and founded users if access token valid and nickname provided', async (): Promise<void> => {
			isAuthorized = true;

			const responseResult = <SuccessfulResponseResult<UserPublicDto>>{
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [
					{
						id: '9c5c84ac-d036-464e-b9f9-e8b4c680ee50',
						avatarUrl: null,
						firstName: 'Groot',
						lastName: null,
						nickname: 'groot',
					},
				],
				dataLength: 1,
			};

			await request(app.getHttpServer())
				.get('/search/find-users')
				.query({ nickname: 'groot' })
				.query({ page: 1 })
				.query({ take: 10 })
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.OK)
				.expect(responseResult);
		});

		it('should return 200 status and founded users if page and take queries not provided', async (): Promise<void> => {
			isAuthorized = true;

			const responseResult = <SuccessfulResponseResult<UserPublicDto>>{
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [
					{
						id: '9c5c84ac-d036-464e-b9f9-e8b4c680ee50',
						avatarUrl: null,
						firstName: 'Groot',
						lastName: null,
						nickname: 'groot',
					},
				],
				dataLength: 1,
			};

			await request(app.getHttpServer())
				.get('/search/find-users')
				.query({ nickname: 'groot' })
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.OK)
				.expect(responseResult);
		});

		it('should call getPublicUsers method from users service to get users by nickname', async (): Promise<void> => {
			const nickname: string = 'groot';
			const page: number = 1;
			const take: number = 10;

			await searchController.findUsers(appUserPayload, nickname, page, take);

			expect(usersServiceMock.getPublicUsers).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getPublicUsers).toHaveBeenCalledWith(
				appUserPayload.nickname,
				nickname,
				page,
				take,
			);
		});

		it('should return each user as instance of UserPublicDto', async (): Promise<void> => {
			const response: UserPublicDto[] = await searchController.findUsers(
				appUserPayload,
				'groot',
				1,
				10,
			);

			response.forEach((user: UserPublicDto) => {
				expect(user).toBeInstanceOf(UserPublicDto);
			});
		});
	});
});
