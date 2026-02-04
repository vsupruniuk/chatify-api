import { Test, TestingModule } from '@nestjs/testing';

import { Socket } from 'socket.io';

import { WsClientsService } from '@services';

describe('Ws clients', (): void => {
	let wsClientsService: WsClientsService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [WsClientsService],
		}).compile();

		wsClientsService = moduleFixture.get(WsClientsService);
	});

	describe('Set', (): void => {
		const userOneId: string = '123';
		const userTwoId: string = '456';
		const clientOneMock: Socket = { id: '123' } as Socket;
		const clientTwoMock: Socket = { id: '456' } as Socket;

		beforeEach((): void => {
			const clientsMap: Map<string, Socket> = (
				wsClientsService as unknown as { _clients: Map<string, Socket> }
			)._clients;

			clientsMap.clear();
		});

		it('should store client socket by user id', (): void => {
			wsClientsService.set(userOneId, clientOneMock);

			const clientsMap: Map<string, Socket> = (
				wsClientsService as unknown as { _clients: Map<string, Socket> }
			)._clients;

			expect(clientsMap.has(userOneId)).toBe(true);
			expect(clientsMap.get(userOneId)).toBe(clientOneMock);
		});

		it('should override existing client', (): void => {
			const clientsMap: Map<string, Socket> = (
				wsClientsService as unknown as { _clients: Map<string, Socket> }
			)._clients;

			wsClientsService.set(userOneId, clientOneMock);

			expect(clientsMap.get(userOneId)).toBe(clientOneMock);

			wsClientsService.set(userOneId, clientTwoMock);

			expect(clientsMap.get(userOneId)).toBe(clientTwoMock);
		});

		it('should store multiple sockets', (): void => {
			wsClientsService.set(userOneId, clientOneMock);
			wsClientsService.set(userTwoId, clientTwoMock);

			const clientsMap: Map<string, Socket> = (
				wsClientsService as unknown as { _clients: Map<string, Socket> }
			)._clients;

			expect(clientsMap.has(userOneId)).toBe(true);
			expect(clientsMap.has(userTwoId)).toBe(true);

			expect(clientsMap.get(userOneId)).toBe(clientOneMock);
			expect(clientsMap.get(userTwoId)).toBe(clientTwoMock);
		});
	});
});
