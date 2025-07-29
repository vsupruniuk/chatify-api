import { WsClientsService } from '@services/wsClients/wsClients.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { WSEvents } from '@enums/WSEvents.enum';
import { ResponseStatus } from '@enums/ResponseStatus.enum';

describe('Ws clients', (): void => {
	let wsClientsService: WsClientsService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [WsClientsService],
		}).compile();

		wsClientsService = moduleFixture.get(WsClientsService);
	});

	describe('Notify all clients', (): void => {
		const userOneId: string = '123';
		const userTwoId: string = '456';
		const clientOneMock: Socket = { id: '123', emit: jest.fn() } as unknown as Socket;
		const clientTwoMock: Socket = { id: '456', emit: jest.fn() } as unknown as Socket;

		beforeEach((): void => {
			const clientsMap: Map<string, Socket> = (
				wsClientsService as unknown as { _clients: Map<string, Socket> }
			)._clients;

			clientsMap.clear();
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should emit event for all provided and connected users', (): void => {
			wsClientsService.set(userOneId, clientOneMock);
			wsClientsService.set(userTwoId, clientTwoMock);

			const eventData = { data: 'Chat was created' };

			wsClientsService.notifyAllClients([userOneId, userTwoId], WSEvents.ON_CREATE_CHAT, eventData);

			expect(clientOneMock.emit).toHaveBeenCalledTimes(1);
			expect(clientOneMock.emit).toHaveBeenNthCalledWith(1, WSEvents.ON_CREATE_CHAT, {
				status: ResponseStatus.SUCCESS,
				data: eventData,
			});

			expect(clientTwoMock.emit).toHaveBeenCalledTimes(1);
			expect(clientTwoMock.emit).toHaveBeenNthCalledWith(1, WSEvents.ON_CREATE_CHAT, {
				status: ResponseStatus.SUCCESS,
				data: eventData,
			});
		});

		it('should not emit event for not connected users', (): void => {
			wsClientsService.set(userOneId, clientOneMock);

			const eventData = { data: 'Chat was created' };

			wsClientsService.notifyAllClients([userOneId, userTwoId], WSEvents.ON_CREATE_CHAT, eventData);

			expect(clientOneMock.emit).toHaveBeenCalledTimes(1);
			expect(clientOneMock.emit).toHaveBeenNthCalledWith(1, WSEvents.ON_CREATE_CHAT, {
				status: ResponseStatus.SUCCESS,
				data: eventData,
			});

			expect(clientTwoMock.emit).not.toHaveBeenCalled();
		});
	});
});
