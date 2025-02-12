import {
	CallHandler,
	ExecutionContext,
	HttpStatus,
	INestApplication,
	UnauthorizedException,
	ValidationPipe,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { Headers } from '@enums/Headers.enum';
import { DirectChatsController } from '@controllers/directChats.controller';
import { User } from '@db/entities/User.entity';
import { DirectChat } from '@db/entities/DirectChat.entity';
import { users } from '@testMocks/User/users';
import { directChats } from '@testMocks/DirectChat/directChats';
import { JWTPayloadDto } from '../../../types/dto/JWTTokens/JWTPayload.dto';
import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { TUserPayload } from '@custom-types/users/TUserPayload';
import { IDirectChatsService } from '@interfaces/directChats/IDirectChatsService';
import { DirectChatShortDto } from '../../../types/dto/directChat/DirectChatShort.dto';
import { AppModule } from '@modules/app.module';
import { DirectChatsModule } from '@modules/directChats.module';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { ResponseStatus } from '@enums/ResponseStatus.enum';

describe.skip('DirectChatsController', (): void => {
	let app: INestApplication;
	let directChatsController: DirectChatsController;

	let isAuthorized: boolean = false;

	const validToken: string = 'valid-token';
	const invalidToken: string = 'invalid-token';
	const usersMock: User[] = [...users];
	const directChatsMock: DirectChat[] = [...directChats];

	const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, usersMock[2], {
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

	const directChatsServiceMock: Partial<IDirectChatsService> = {
		getLastChats: jest.fn().mockImplementation(async (): Promise<DirectChatShortDto[]> => {
			return plainToInstance(DirectChatShortDto, [directChatsMock[0]], {
				excludeExtraneousValues: true,
			});
		}),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, DirectChatsModule],
		})
			.overrideProvider(CustomProviders.CTF_DIRECT_CHATS_SERVICE)
			.useValue(directChatsServiceMock)
			.overrideInterceptor(AuthInterceptor)
			.useValue(authInterceptorMock)
			.compile();

		app = moduleFixture.createNestApplication();
		directChatsController = moduleFixture.get<DirectChatsController>(DirectChatsController);

		app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: false }));

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('GET /direct-chats/', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatsController.getLastChats).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsController.getLastChats).toBeInstanceOf(Function);
		});

		it('should return 401 status if authorization header is not passed', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get('/direct-chats')
				.query({ page: 1 })
				.query({ take: 10 })
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token not passed to authorization header', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get('/direct-chats')
				.query({ page: 1 })
				.query({ take: 10 })
				.set(Headers.AUTHORIZATION, 'Bearer')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token invalid', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get('/direct-chats')
				.query({ page: 1 })
				.query({ take: 10 })
				.set(Headers.AUTHORIZATION, `Bearer ${invalidToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 200 status and last chats if access token valid', async (): Promise<void> => {
			isAuthorized = true;

			const responseResult = {
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [
					{
						id: 'a9bdc525-1c35-48c0-a0c6-79601d842f43',
						messages: [
							{
								id: 'a25d0f16-8255-4cf4-a06a-167271bd7720',
								dateTime: '2024-08-03 10:00:00',
								messageText: 'Tony, what if we lose?',
							},
						],
						users: [],
					},
				],
				dataLength: 1,
			};

			await request(app.getHttpServer())
				.get('/direct-chats')
				.query({ page: 1 })
				.query({ take: 10 })
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.OK)
				.expect(responseResult);
		});

		it('should return 200 status and last chats if page and take queries are not provided', async (): Promise<void> => {
			isAuthorized = true;

			const responseResult = {
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [
					{
						id: 'a9bdc525-1c35-48c0-a0c6-79601d842f43',
						messages: [
							{
								id: 'a25d0f16-8255-4cf4-a06a-167271bd7720',
								dateTime: '2024-08-03 10:00:00',
								messageText: 'Tony, what if we lose?',
							},
						],
						users: [],
					},
				],
				dataLength: 1,
			};

			await request(app.getHttpServer())
				.get('/direct-chats')
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.OK)
				.expect(responseResult);
		});

		it('should call getLastChats method from direct chats service to get user last chats', async (): Promise<void> => {
			const page: number = 1;
			const take: number = 10;

			await directChatsController.getLastChats(appUserPayload, page, take);

			expect(directChatsServiceMock.getLastChats).toHaveBeenCalledTimes(1);
			expect(directChatsServiceMock.getLastChats).toHaveBeenCalledWith(
				appUserPayload.id,
				page,
				take,
			);
		});

		it('should return each chat as instance of DirectChatShortDto', async (): Promise<void> => {
			const page: number = 1;
			const take: number = 10;

			const response: DirectChatShortDto[] = await directChatsController.getLastChats(
				appUserPayload,
				page,
				take,
			);

			response.forEach((chat: DirectChatShortDto) => {
				expect(chat).toBeInstanceOf(DirectChatShortDto);
			});
		});
	});
});
