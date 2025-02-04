import { CreateDirectChatDto } from '@DTO/directChat/CreateDIrectChat.dto';
import { CreateDirectChatResponseDto } from '@DTO/directChat/CreateDirectChatResponse.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Headers } from '@Enums/Headers.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { WSEvents } from '@Enums/WSEvents.enum';
import { DirectChatsGateway } from '@Gateways/directChats.gateway';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ErrorWSResponseResult } from '@Responses/errorResponses/ErrorWSResponseResult';
import { ValidationErrorField } from '@Responses/errors/ValidationErrorField';
import { SuccessfulWSResponseResult } from '@Responses/successfulResponses/SuccessfulWSResponseResult';
import { users } from '@TestMocks/User/users';
import { plainToInstance } from 'class-transformer';
import { io, Socket } from 'socket.io-client';
import { directChats } from '@TestMocks/DirectChat/directChats';
import { DirectChat } from '@Entities/DirectChat.entity';
import { DirectChatShortDto } from '@DTO/directChat/DirectChatShort.dto';

describe('Direct chat gateway', (): void => {
	let app: INestApplication;
	let directChatsGateway: DirectChatsGateway;

	const port: number = Number(process.env.TESTS_PORT);
	const validAccessToken: string = 'validAccessToken';
	const validAccessTokenReceiver: string = 'validAccessTokenReceiver';
	const invalidAccessToken: string = 'invalidAccessToken';
	const createdChat: DirectChat = directChats[0];

	const jwtServiceMock: Partial<IJWTTokensService> = {
		verifyAccessToken: jest
			.fn()
			.mockImplementation(async (token: string): Promise<JWTPayloadDto | null> => {
				if (token === validAccessToken) {
					return plainToInstance(JWTPayloadDto, users[2]);
				}

				if (token === validAccessTokenReceiver) {
					return plainToInstance(JWTPayloadDto, users[3]);
				}

				return null;
			}),
	};

	const directChatsServiceMock: Partial<IDirectChatsService> = {
		createChat: jest
			.fn()
			.mockImplementation(() =>
				plainToInstance(DirectChatShortDto, createdChat, { excludeExtraneousValues: true }),
			),
	};

	beforeAll(async (): Promise<void> => {
		const testingModule: TestingModule = await Test.createTestingModule({
			providers: [
				DirectChatsGateway,
				{
					provide: CustomProviders.CTF_DIRECT_CHATS_SERVICE,
					useValue: directChatsServiceMock,
				},
				{ provide: CustomProviders.CTF_JWT_TOKENS_SERVICE, useValue: jwtServiceMock },
			],
		}).compile();

		app = testingModule.createNestApplication();
		directChatsGateway = testingModule.get<DirectChatsGateway>(DirectChatsGateway);

		await app.listen(port);
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('createDirectChat', (): void => {
		let socket: Socket;
		let socketReceiver: Socket;

		afterEach((): void => {
			if (socket && socket.connected) {
				socket.disconnect();
			}

			if (socketReceiver && socketReceiver.connected) {
				socketReceiver.disconnect();
			}

			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatsGateway.createDirectChat).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsGateway.createDirectChat).toBeInstanceOf(Function);
		});

		it('should reject unauthorized connection', async () => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
			});

			socket.connect();

			await new Promise<void>((resolve, reject) => {
				socket.on('connect', () => {
					reject('Unauthorized socket connected');
				});

				socket.on('connect_error', (err: Error) => {
					expect(err.message).toBe('Unauthorized Exception');
					resolve();
				});
			});
		});

		it('should reject connection if authorization token provided without value', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: '' },
			});

			socket.connect();

			await new Promise<void>((resolve, reject) => {
				socket.on('connect', () => {
					reject('Unauthorized socket connected');
				});

				socket.on('connect_error', (err: Error) => {
					expect(err.message).toBe('Unauthorized Exception');
					resolve();
				});
			});
		});

		it('should reject connection if authorization token provided without access token', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: 'Bearer' },
			});

			socket.connect();

			await new Promise<void>((resolve, reject) => {
				socket.on('connect', () => {
					reject('Unauthorized socket connected');
				});

				socket.on('connect_error', (err: Error) => {
					expect(err.message).toBe('Unauthorized Exception');
					resolve();
				});
			});
		});

		it('should reject connection if authorization token provided with invalid access token', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${invalidAccessToken}` },
			});

			socket.connect();

			await new Promise<void>((resolve, reject) => {
				socket.on('connect', () => {
					reject('Unauthorized socket connected');
				});

				socket.on('connect_error', (err: Error) => {
					expect(err.message).toBe('Unauthorized Exception');
					resolve();
				});
			});
		});

		it('should successfully connect authorized client', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			socket.connect();

			await new Promise<void>((resolve, reject) => {
				socket.on('connect', () => {
					resolve();
				});

				socket.on('connect_error', (err: Error) => {
					reject(err);
				});
			});
		});

		it('should call verifyAccessToken method in jwt service to verify client access token', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			socket.connect();

			await new Promise<void>((resolve) => {
				socket.on('connect', () => {
					resolve();
				});
			});

			expect(jwtServiceMock.verifyAccessToken).toHaveBeenCalledTimes(1);
			expect(jwtServiceMock.verifyAccessToken).toHaveBeenCalledWith(validAccessToken);
		});

		it('should emit error event with Bad Request Exception if receiver id is not provided in event data', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const createDirectChatDto = {
				messageText: 'Hello, world!',
			} as CreateDirectChatDto;

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [{ message: 'Wrong receiverId format. UUID is expected', field: null }],
				errorsLength: 1,
			};

			socket.connect();
			socket.emit(WSEvents.CREATE_CHAT, createDirectChatDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Error event was not triggered');
				});

				socket.on(WSEvents.ON_ERROR, (error: ErrorWSResponseResult<ValidationErrorField>) => {
					expect(error.title).toEqual(errorResponse.title);
					expect(error.errors).toEqual(errorResponse.errors);
					resolve();
				});
			});
		});

		it('should emit error event with Bad Request Exception if receiver id is invalid uuid', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const createDirectChatDto = {
				receiverId: '123',
				messageText: 'Hello, world!',
			} as CreateDirectChatDto;

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [{ message: 'Wrong receiverId format. UUID is expected', field: null }],
				errorsLength: 1,
			};

			socket.connect();
			socket.emit(WSEvents.CREATE_CHAT, createDirectChatDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Error event was not triggered');
				});

				socket.on(WSEvents.ON_ERROR, (error: ErrorWSResponseResult<ValidationErrorField>) => {
					expect(error.title).toEqual(errorResponse.title);
					expect(error.errors).toEqual(errorResponse.errors);
					resolve();
				});
			});
		});

		it('should emit error event with Bad Request Exception if message text was not provided', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const createDirectChatDto = {
				receiverId: '083dc6f8-cbfb-4f0f-8f15-87410aa8ea21',
			} as CreateDirectChatDto;

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [
					{
						message: 'messageText can be 500 characters long maximum',
						field: 'messageText',
					},
					{
						message: 'messageText must be at least 1 characters long',
						field: 'messageText',
					},
					{ message: 'messageText must be a string', field: 'messageText' },
				],
				errorsLength: 3,
			};

			socket.connect();
			socket.emit(WSEvents.CREATE_CHAT, createDirectChatDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Error event was not triggered');
				});

				socket.on(WSEvents.ON_ERROR, (error: ErrorWSResponseResult<ValidationErrorField>) => {
					expect(error.title).toEqual(errorResponse.title);
					expect(error.errors).toEqual(errorResponse.errors);
					resolve();
				});
			});
		});

		it('should emit error event with Bad Request Exception if message text is not a string', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const createDirectChatDto = {
				receiverId: '083dc6f8-cbfb-4f0f-8f15-87410aa8ea21',
				messageText: 2,
			};

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [
					{
						message: 'messageText can be 500 characters long maximum',
						field: 'messageText',
					},
					{
						message: 'messageText must be at least 1 characters long',
						field: 'messageText',
					},
					{ message: 'messageText must be a string', field: 'messageText' },
				],
				errorsLength: 3,
			};

			socket.connect();
			socket.emit(WSEvents.CREATE_CHAT, createDirectChatDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Error event was not triggered');
				});

				socket.on(WSEvents.ON_ERROR, (error: ErrorWSResponseResult<ValidationErrorField>) => {
					expect(error.title).toEqual(errorResponse.title);
					expect(error.errors).toEqual(errorResponse.errors);
					resolve();
				});
			});
		});

		it('should emit error event with Bad Request Exception if message text is empty string', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const createDirectChatDto = {
				receiverId: '083dc6f8-cbfb-4f0f-8f15-87410aa8ea21',
				messageText: '',
			} as CreateDirectChatDto;

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [
					{
						message: 'messageText must be at least 1 characters long',
						field: 'messageText',
					},
				],
				errorsLength: 1,
			};

			socket.connect();
			socket.emit(WSEvents.CREATE_CHAT, createDirectChatDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Error event was not triggered');
				});

				socket.on(WSEvents.ON_ERROR, (error: ErrorWSResponseResult<ValidationErrorField>) => {
					expect(error.title).toEqual(errorResponse.title);
					expect(error.errors).toEqual(errorResponse.errors);
					resolve();
				});
			});
		});

		it('should emit error event with Bad Request Exception if message text is too long', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const createDirectChatDto = {
				receiverId: '083dc6f8-cbfb-4f0f-8f15-87410aa8ea21',
				messageText: 'H'.padEnd(501, 'H'),
			} as CreateDirectChatDto;

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [
					{
						message: 'messageText can be 500 characters long maximum',
						field: 'messageText',
					},
				],
				errorsLength: 1,
			};

			socket.connect();
			socket.emit(WSEvents.CREATE_CHAT, createDirectChatDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.ON_CREATE_CHAT, () => {
					reject('Error event was not triggered');
				});

				socket.on(WSEvents.ON_ERROR, (error: ErrorWSResponseResult<ValidationErrorField>) => {
					expect(error.title).toEqual(errorResponse.title);
					expect(error.errors).toEqual(errorResponse.errors);
					resolve();
				});
			});
		});

		it('should emit on created chat event end notify sender about created chat', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const createDirectChatDto = {
				receiverId: '083dc6f8-cbfb-4f0f-8f15-87410aa8ea21',
				messageText: 'Hello, world!',
			} as CreateDirectChatDto;

			const successfulResponse: SuccessfulWSResponseResult<CreateDirectChatResponseDto> = {
				status: ResponseStatus.SUCCESS,
				data: {
					directChat: plainToInstance(DirectChatShortDto, createdChat, {
						excludeExtraneousValues: true,
					}),
				},
			};

			socket.connect();
			socket.emit(WSEvents.CREATE_CHAT, createDirectChatDto);

			await new Promise<void>((resolve) => {
				socket.on(WSEvents.ON_CREATE_CHAT, (response) => {
					expect(response).toEqual(successfulResponse);
					resolve();
				});
			});
		});

		it('should emit on created chat event end notify receiver about created chat if receiver is connected', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			socketReceiver = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessTokenReceiver}` },
			});

			const createDirectChatDto = {
				receiverId: '699901e8-653f-4ac2-841e-b85388c4b89c',
				messageText: 'Hello, world!',
			} as CreateDirectChatDto;

			const successfulResponse: SuccessfulWSResponseResult<CreateDirectChatResponseDto> = {
				status: ResponseStatus.SUCCESS,
				data: {
					directChat: plainToInstance(DirectChatShortDto, createdChat, {
						excludeExtraneousValues: true,
					}),
				},
			};

			socket.connect();
			socketReceiver.connect();

			socket.emit(WSEvents.CREATE_CHAT, createDirectChatDto);

			await new Promise<void>((resolve) => {
				socketReceiver.on(WSEvents.ON_CREATE_CHAT, (response) => {
					expect(response).toEqual(successfulResponse);
					resolve();
				});
			});
		});

		it('should call createChat method in direct chats service', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const createDirectChatDto = {
				receiverId: '699901e8-653f-4ac2-841e-b85388c4b89c',
				messageText: 'Hello, world!',
			} as CreateDirectChatDto;

			socket.connect();

			socket.emit(WSEvents.CREATE_CHAT, createDirectChatDto);

			await new Promise<void>((resolve) => {
				socket.on(WSEvents.ON_CREATE_CHAT, () => {
					expect(directChatsServiceMock.createChat).toHaveBeenCalledTimes(1);
					expect(directChatsServiceMock.createChat).toHaveBeenCalledWith(
						users[2].id,
						createDirectChatDto.receiverId,
						createDirectChatDto.messageText,
					);

					resolve();
				});
			});
		});
	});
});
