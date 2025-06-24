import { WsClientsService } from '@services/wsClients/wsClients.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';

describe('Ws clients', (): void => {
	let wsClientsService: WsClientsService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [WsClientsService],
		}).compile();

		wsClientsService = moduleFixture.get(WsClientsService);
	});

	describe('Delete', (): void => {
		const userOneId: string = '123';
		const userTwoId: string = '456';
		const clientOneMock: Socket = { id: '123' } as Socket;
		const clientTwoMock: Socket = { id: '456' } as Socket;

		beforeEach((): void => {
			wsClientsService.set(userOneId, clientOneMock);
		});

		afterEach((): void => {
			const clientsMap: Map<string, Socket> = (
				wsClientsService as unknown as { _clients: Map<string, Socket> }
			)._clients;

			clientsMap.clear();
		});

		it('should be defined', (): void => {
			expect(wsClientsService.delete).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(wsClientsService.delete).toBeInstanceOf(Function);
		});

		it('should delete a client by user id', (): void => {
			wsClientsService.delete(userOneId);

			const clientsMap: Map<string, Socket> = (
				wsClientsService as unknown as { _clients: Map<string, Socket> }
			)._clients;

			expect(clientsMap.has(userOneId)).toBe(false);
			expect(clientsMap.get(userOneId)).toBeUndefined();
		});

		it('should do nothing and not throw errors on delete not existing client', (): void => {
			expect(() => wsClientsService.delete(userTwoId)).not.toThrow();

			const clientsMap: Map<string, Socket> = (
				wsClientsService as unknown as { _clients: Map<string, Socket> }
			)._clients;

			expect(clientsMap.size).toBe(1);
		});

		it('should delete a client only for provided id', (): void => {
			wsClientsService.set(userTwoId, clientTwoMock);

			wsClientsService.delete(userOneId);

			const clientsMap: Map<string, Socket> = (
				wsClientsService as unknown as { _clients: Map<string, Socket> }
			)._clients;

			expect(clientsMap.has(userTwoId)).toBe(true);

			expect(clientsMap.get(userTwoId)).toBe(clientTwoMock);
		});
	});
});
