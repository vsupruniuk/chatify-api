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

	describe('saveRefreshToken', (): void => {
		let getByIdMock: SpyInstance;
		let createTokenMock: SpyInstance;
		let updateTokenMock: SpyInstance;

		const jwtTokensMock: JWTTokenFullDto[] = [...jwtTokens];
		const jwtTokenMock: string = 'jwt-token-1-new';
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '4';
		const createdTokenId: string = '5';

		beforeEach((): void => {
			getByIdMock = jest
				.spyOn(jwtTokensRepository, 'getById')
				.mockImplementation(async (id: string): Promise<JWTTokenFullDto | null> => {
					return jwtTokensMock.find((token: JWTTokenFullDto) => token.id === id) || null;
				});

			createTokenMock = jest
				.spyOn(jwtTokensRepository, 'createToken')
				.mockImplementation(async (): Promise<string> => createdTokenId);

			updateTokenMock = jest
				.spyOn(jwtTokensRepository, 'updateToken')
				.mockImplementation(async (id: string): Promise<boolean> => {
					return jwtTokensMock.some((token: JWTTokenFullDto) => token.id === id);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(jwtTokensService.generateRefreshToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensService.generateRefreshToken).toBeInstanceOf(Function);
		});

		it('should call getById method in jwtTokens repository to check if token already exist', async (): Promise<void> => {
			await jwtTokensService.saveRefreshToken(existingTokenId, jwtTokenMock);

			expect(getByIdMock).toHaveBeenCalledTimes(1);
			expect(getByIdMock).toHaveBeenCalledWith(existingTokenId);
		});

		it('should call createToken method and not call updateToken in jwtTokens repository to create token, if it not exist', async (): Promise<void> => {
			await jwtTokensService.saveRefreshToken(notExistingTokenId, jwtTokenMock);

			expect(createTokenMock).toHaveBeenCalledTimes(1);
			expect(createTokenMock).toHaveBeenCalledWith(jwtTokenMock);

			expect(updateTokenMock).not.toHaveBeenCalled();
		});

		it('should call updateToken method and not call createToken in jwtTokens repository to update token, if it exist', async (): Promise<void> => {
			await jwtTokensService.saveRefreshToken(existingTokenId, jwtTokenMock);

			expect(updateTokenMock).toHaveBeenCalledTimes(1);
			expect(updateTokenMock).toHaveBeenCalledWith(existingTokenId, jwtTokenMock);

			expect(createTokenMock).not.toHaveBeenCalled();
		});

		it('should return token id if token was created', async (): Promise<void> => {
			const id: string = await jwtTokensService.saveRefreshToken(notExistingTokenId, jwtTokenMock);

			expect(id).toBe(createdTokenId);
		});

		it('should return true if token was updated', async (): Promise<void> => {
			const id: string = await jwtTokensService.saveRefreshToken(existingTokenId, jwtTokenMock);

			expect(id).toBe(existingTokenId);
		});
	});
});
