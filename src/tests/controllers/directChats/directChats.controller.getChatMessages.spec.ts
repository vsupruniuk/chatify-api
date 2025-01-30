import {
	CallHandler,
	ExecutionContext,
	HttpStatus,
	INestApplication,
	UnauthorizedException,
	ValidationPipe,
} from '@nestjs/common';
import { DirectChatsController } from '@Controllers/directChats.controller';
import { User } from '@Entities/User.entity';
import { users } from '@TestMocks/User/users';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { directChatsMessages } from '@TestMocks/DirectChatMessage/directChatsMessages';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { plainToInstance } from 'class-transformer';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { TUserPayload } from '@Types/users/TUserPayload';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@Modules/app.module';
import { DirectChatsModule } from '@Modules/directChats.module';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import * as request from 'supertest';
import { Headers } from '@Enums/Headers.enum';
import { directChats } from '@TestMocks/DirectChat/directChats';
import { DirectChatMessageWithChatDto } from '@DTO/directChatMessages/DirectChatMessageWithChat.dto';
import { ResponseResult } from '@Responses/ResponseResult';

describe('Direct chats controller', (): void => {
	let app: INestApplication;
	let directChatsController: DirectChatsController;

	let isAuthorized: boolean = false;

	const validToken: string = 'valid-token';
	const invalidToken: string = 'invalid-token';
	const usersMock: User[] = [...users];
	const directChatsMessagesMock: DirectChatMessage[] = [...directChatsMessages];
	const chatIdMock: string = directChats[0].id;

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
		getChatMessages: jest.fn().mockImplementation(() =>
			plainToInstance(DirectChatMessageWithChatDto, [directChatsMessagesMock[0]], {
				excludeExtraneousValues: true,
			}),
		),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, DirectChatsModule],
		})
			.overrideProvider(CustomProviders.CTF_DIRECT_CHATS_SERVICE_PROVIDER)
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

	describe('GET /direct-chats/chat-messages', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatsController.getChatMessages).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsController.getChatMessages).toBeInstanceOf(Function);
		});

		it('should return 401 status if authorization header is not passed', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get('/direct-chats/chat-messages')
				.query({ page: 1 })
				.query({ take: 10 })
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token not passed to authorization header', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get('/direct-chats/chat-messages')
				.query({ page: 1 })
				.query({ take: 10 })
				.set(Headers.AUTHORIZATION, 'Bearer')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token invalid', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get('/direct-chats/chat-messages')
				.query({ page: 1 })
				.query({ take: 10 })
				.set(Headers.AUTHORIZATION, `Bearer ${invalidToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 400 status if chatId query is not passed', async (): Promise<void> => {
			isAuthorized = true;

			await request(app.getHttpServer())
				.get('/direct-chats/chat-messages')
				.query({ page: 1 })
				.query({ take: 10 })
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 200 status and last chat messages if access token valid', async (): Promise<void> => {
			isAuthorized = true;

			await request(app.getHttpServer())
				.get('/direct-chats/chat-messages')
				.query({ chatId: chatIdMock })
				.query({ page: 1 })
				.query({ take: 10 })
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.OK);
		});

		it('should call getChatMessages method from direct chats service to get last chat messages', async (): Promise<void> => {
			const page: number = 1;
			const take: number = 10;

			await directChatsController.getChatMessages(appUserPayload, chatIdMock, page, take);

			expect(directChatsServiceMock.getChatMessages).toHaveBeenCalledTimes(1);
			expect(directChatsServiceMock.getChatMessages).toHaveBeenCalledWith(
				appUserPayload.id,
				chatIdMock,
				page,
				take,
			);
		});

		it('should return response as instance of ResponseResult', async (): Promise<void> => {
			const page: number = 1;
			const take: number = 10;

			const response: ResponseResult = await directChatsController.getChatMessages(
				appUserPayload,
				chatIdMock,
				page,
				take,
			);

			expect(response).toBeInstanceOf(ResponseResult);
		});
	});
});
