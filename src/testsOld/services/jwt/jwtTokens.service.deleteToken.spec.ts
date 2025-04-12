import { JwtTokensService } from '@services/jwt/jwtTokens.service';
import { JwtTokensRepository } from '@repositories/jwtTokens/jwtTokens.repository';
import { JwtService } from '@nestjs/jwt';
import { connectionSource } from '@db/typeOrmConfig';
import SpyInstance = jest.SpyInstance;
import { JWTToken } from '@entities/JWTToken.entity';
import { jwtTokens } from '@testMocks/JWTToken/jwtTokens';

describe.skip('jwtTokensService', (): void => {
	let jwtTokensService: JwtTokensService;
	let jwtTokensRepository: JwtTokensRepository;

	beforeEach((): void => {
		const jwtService: JwtService = new JwtService();
		jwtTokensRepository = new JwtTokensRepository(connectionSource);

		jwtTokensService = new JwtTokensService(jwtService, jwtTokensRepository);
	});

	describe('deleteToken', (): void => {
		let deleteTokenMock: SpyInstance;

		const jwtTokensMock: JWTToken[] = [...jwtTokens];
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '4';

		beforeEach((): void => {
			deleteTokenMock = jest
				.spyOn(jwtTokensRepository, 'deleteToken')
				.mockImplementation(async (id: string): Promise<boolean> => {
					return jwtTokensMock.some((token: JWTToken) => token.id === id);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(jwtTokensService.deleteToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensService.deleteToken).toBeInstanceOf(Function);
		});

		it('should call deleteToken method from jwtTokens repository to delete token', async (): Promise<void> => {
			await jwtTokensService.deleteToken(existingTokenId);

			expect(deleteTokenMock).toHaveBeenCalledTimes(1);
			expect(deleteTokenMock).toHaveBeenCalledWith(existingTokenId);
		});

		it('should return true if token was deleted', async (): Promise<void> => {
			const isDeleted: boolean = await jwtTokensService.deleteToken(existingTokenId);

			expect(isDeleted).toBe(true);
		});

		it('should return false if token was not deleted', async (): Promise<void> => {
			const isDeleted: boolean = await jwtTokensService.deleteToken(notExistingTokenId);

			expect(isDeleted).toBe(false);
		});
	});
});
