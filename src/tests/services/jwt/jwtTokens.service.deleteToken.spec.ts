import { connectionSource } from '@DB/typeOrmConfig';
import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { JwtService } from '@nestjs/jwt';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { JwtTokensService } from '@Services/jwtTokens.service';
import { jwtTokens } from '@TestMocks/JWTTokenFullDto/jwtTokens';
import SpyInstance = jest.SpyInstance;

describe('jwtTokensService', (): void => {
	let jwtTokensService: JwtTokensService;
	let jwtTokensRepository: JWTTokensRepository;

	beforeEach((): void => {
		const jwtService: JwtService = new JwtService();
		jwtTokensRepository = new JWTTokensRepository(connectionSource);

		jwtTokensService = new JwtTokensService(jwtService, jwtTokensRepository);
	});

	describe('deleteToken', (): void => {
		let deleteTokenMock: SpyInstance;

		const jwtTokensMock: JWTTokenFullDto[] = [...jwtTokens];
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '4';

		beforeEach((): void => {
			deleteTokenMock = jest
				.spyOn(jwtTokensRepository, 'deleteToken')
				.mockImplementation(async (id: string): Promise<boolean> => {
					return jwtTokensMock.some((token: JWTTokenFullDto) => token.id === id);
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
