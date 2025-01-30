import { INestApplication } from '@nestjs/common';
import { DirectChatsGateway } from '@Gateways/directChats.gateway';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { directChatsMessages } from '@TestMocks/DirectChatMessage/directChatsMessages';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { plainToInstance } from 'class-transformer';
import { users } from '@TestMocks/User/users';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { io, Socket } from 'socket.io-client';
import { Headers } from '@Enums/Headers.enum';
import { ErrorWSResponseResult } from '@Responses/errorResponses/ErrorWSResponseResult';
import { ValidationErrorField } from '@Responses/errors/ValidationErrorField';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { WSEvents } from '@Enums/WSEvents.enum';
import { SendDirectMessageDto } from '@DTO/directChatMessages/SendDirectMessage.dto';
import { SuccessfulWSResponseResult } from '@Responses/successfulResponses/SuccessfulWSResponseResult';
import { DirectChatMessageWithChatDto } from '@DTO/directChatMessages/DirectChatMessageWithChat.dto';

describe('Direct chats gateway', (): void => {
	let app: INestApplication;
	let directChatsGateway: DirectChatsGateway;

	const port: number = Number(process.env.TESTS_PORT) || 3000;
	const validAccessToken: string = 'validAccessToken';
	const validAccessTokenReceiver: string = 'validAccessTokenReceiver';
	const invalidAccessToken: string = 'invalidAccessToken';
	const createdMessage: DirectChatMessage = directChatsMessages[0];

	const jwtServiceMock: Partial<IJWTTokensService> = {
		verifyAccessToken: jest
			.fn()
			.mockImplementation(async (token: string): Promise<JWTPayloadDto | null> => {
				if (token === validAccessToken) {
					return plainToInstance(JWTPayloadDto, users[3]);
				}

				if (token === validAccessTokenReceiver) {
					return plainToInstance(JWTPayloadDto, users[2]);
				}

				return null;
			}),
	};

	const directChatsServiceMock: Partial<IDirectChatsService> = {
		sendMessage: jest.fn().mockImplementation(() => createdMessage),
	};

	beforeAll(async (): Promise<void> => {
		createdMessage.directChat.users = [users[2], users[3]];

		const testingModule: TestingModule = await Test.createTestingModule({
			providers: [
				DirectChatsGateway,
				{
					provide: CustomProviders.CTF_DIRECT_CHATS_SERVICE_PROVIDER,
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

	describe('sendMessage', (): void => {
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
			expect(directChatsGateway.sendMessage).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsGateway.sendMessage).toBeInstanceOf(Function);
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

		it('should emit error event with Bad Request Exception if direct chat id is not provided in event data', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const sendDirectMessageDto = {
				messageText: 'Hello, world!',
			} as SendDirectMessageDto;

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [{ message: 'Wrong directChatId format. UUID is expected', field: null }],
				errorsLength: 1,
			};

			socket.connect();
			socket.emit(WSEvents.SEND_MESSAGE, sendDirectMessageDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.SEND_MESSAGE, () => {
					reject('Error event was not triggered');
				});

				socket.on(WSEvents.ON_ERROR, (error: ErrorWSResponseResult<ValidationErrorField>) => {
					expect(error.title).toEqual(errorResponse.title);
					expect(error.errors).toEqual(errorResponse.errors);
					resolve();
				});
			});
		});

		it('should emit error event with Bad Request Exception if direct chat id is invalid uuid', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const sendDirectMessageDto = {
				directChatId: '123',
				messageText: 'Hello, world!',
			} as SendDirectMessageDto;

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [{ message: 'Wrong directChatId format. UUID is expected', field: null }],
				errorsLength: 1,
			};

			socket.connect();
			socket.emit(WSEvents.SEND_MESSAGE, sendDirectMessageDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.SEND_MESSAGE, () => {
					reject('Error event was not triggered');
				});

				socket.on(WSEvents.ON_ERROR, (error: ErrorWSResponseResult<ValidationErrorField>) => {
					expect(error.title).toEqual(errorResponse.title);
					expect(error.errors).toEqual(errorResponse.errors);
					resolve();
				});
			});
		});

		it('should emit error event with Bad Request Exception if message text is missed', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const sendDirectMessageDto = {
				directChatId: '8612e6df-1600-4eeb-bd1d-64dfda26dc06',
			} as SendDirectMessageDto;

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [
					{
						field: 'messageText',
						message: 'messageText can be 500 characters long maximum',
					},
					{
						field: 'messageText',
						message: 'messageText must be at least 1 characters long',
					},
					{
						field: 'messageText',
						message: 'messageText must be a string',
					},
				],
				errorsLength: 1,
			};

			socket.connect();
			socket.emit(WSEvents.SEND_MESSAGE, sendDirectMessageDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.SEND_MESSAGE, () => {
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

			const sendDirectMessageDto = {
				directChatId: '8612e6df-1600-4eeb-bd1d-64dfda26dc06',
				messageText: 2,
			};

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [
					{
						field: 'messageText',
						message: 'messageText can be 500 characters long maximum',
					},
					{
						field: 'messageText',
						message: 'messageText must be at least 1 characters long',
					},
					{
						field: 'messageText',
						message: 'messageText must be a string',
					},
				],
				errorsLength: 1,
			};

			socket.connect();
			socket.emit(WSEvents.SEND_MESSAGE, sendDirectMessageDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.SEND_MESSAGE, () => {
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

			const sendDirectMessageDto = {
				directChatId: '8612e6df-1600-4eeb-bd1d-64dfda26dc06',
				messageText: '',
			} as SendDirectMessageDto;

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [
					{ message: 'messageText must be at least 1 characters long', field: 'messageText' },
				],
				errorsLength: 1,
			};

			socket.connect();
			socket.emit(WSEvents.SEND_MESSAGE, sendDirectMessageDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.SEND_MESSAGE, () => {
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

			const sendDirectMessageDto = {
				directChatId: '8612e6df-1600-4eeb-bd1d-64dfda26dc06',
				messageText: 'H'.padEnd(501, 'H'),
			} as SendDirectMessageDto;

			const errorResponse: ErrorWSResponseResult<ValidationErrorField> = {
				status: ResponseStatus.ERROR,
				title: 'Bad Request',
				errors: [
					{ message: 'messageText can be 500 characters long maximum', field: 'messageText' },
				],
				errorsLength: 1,
			};

			socket.connect();
			socket.emit(WSEvents.SEND_MESSAGE, sendDirectMessageDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.SEND_MESSAGE, () => {
					reject('Error event was not triggered');
				});

				socket.on(WSEvents.ON_ERROR, (error: ErrorWSResponseResult<ValidationErrorField>) => {
					expect(error.title).toEqual(errorResponse.title);
					expect(error.errors).toEqual(errorResponse.errors);
					resolve();
				});
			});
		});

		it('should emit send message event end notify sender about created message', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const sendDirectMessageDto = {
				directChatId: '8612e6df-1600-4eeb-bd1d-64dfda26dc06',
				messageText: 'Hello world',
			} as SendDirectMessageDto;

			const successfulResponse: SuccessfulWSResponseResult<DirectChatMessageWithChatDto> = {
				status: ResponseStatus.SUCCESS,
				data: createdMessage,
			};

			socket.connect();
			socket.emit(WSEvents.SEND_MESSAGE, sendDirectMessageDto);

			await new Promise<void>((resolve) => {
				socket.on(WSEvents.SEND_MESSAGE, (response) => {
					expect(response).toEqual(successfulResponse);
					resolve();
				});
			});
		});

		it('should emit on receive message event end notify receiver about created message if receiver is connected', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			socketReceiver = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessTokenReceiver}` },
			});

			const sendDirectMessageDto = {
				directChatId: 'a9bdc525-1c35-48c0-a0c6-79601d842f43',
				messageText: 'Hello world',
			} as SendDirectMessageDto;

			const successfulResponse: SuccessfulWSResponseResult<DirectChatMessageWithChatDto> = {
				status: ResponseStatus.SUCCESS,
				data: createdMessage,
			};

			socket.connect();
			socketReceiver.connect();

			socket.emit(WSEvents.SEND_MESSAGE, sendDirectMessageDto);

			await new Promise<void>((resolve) => {
				socketReceiver.on(WSEvents.ON_RECEIVE_MESSAGE, (response) => {
					expect(response).toEqual(successfulResponse);
					resolve();
				});
			});
		});

		it('should call sendMessage method in direct chats service to create message', async (): Promise<void> => {
			socket = io(`http://localhost:${port}`, {
				transports: ['websocket'],
				extraHeaders: { [Headers.AUTHORIZATION]: `Bearer ${validAccessToken}` },
			});

			const sendDirectMessageDto = {
				directChatId: 'a9bdc525-1c35-48c0-a0c6-79601d842f43',
				messageText: 'Hello world',
			} as SendDirectMessageDto;

			socket.connect();

			socket.emit(WSEvents.SEND_MESSAGE, sendDirectMessageDto);

			await new Promise<void>((resolve, reject) => {
				socket.on(WSEvents.SEND_MESSAGE, () => {
					expect(directChatsServiceMock.sendMessage).toHaveBeenCalledTimes(1);
					expect(directChatsServiceMock.sendMessage).toHaveBeenCalledWith(
						users[3].id,
						sendDirectMessageDto.directChatId,
						sendDirectMessageDto.messageText,
					);

					socket.on(WSEvents.ON_ERROR, (error: ErrorWSResponseResult<ValidationErrorField>) => {
						reject(error);
					});

					resolve();
				});
			});
		});
	});
});
