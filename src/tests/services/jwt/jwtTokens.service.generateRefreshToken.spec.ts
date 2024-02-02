import { connectionSource } from '@DB/typeOrmConfig';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { JwtService } from '@nestjs/jwt';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { JwtTokensService } from '@Services/jwtTokens.service';
import SpyInstance = jest.SpyInstance;

describe('jwtTokensService', (): void => {
	let jwtTokensService: JwtTokensService;
	const jwtService: JwtService = new JwtService();

	beforeEach((): void => {
		const jwtTokensRepository: JWTTokensRepository = new JWTTokensRepository(connectionSource);

		jwtTokensService = new JwtTokensService(jwtService, jwtTokensRepository);
	});

	describe('generateRefreshToken', (): void => {
		let signAsyncMock: SpyInstance;

		const jwtTokenMock: string = 'jwt-token';
		const jwtPayloadMock: JWTPayloadDto = {
			id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
			email: 'tony@mail.com',
			firstName: 'Tony',
			lastName: 'Stark',
			nickname: 't.stark',
		};

		beforeEach((): void => {
			signAsyncMock = jest
				.spyOn(jwtService, 'signAsync')
				.mockImplementation(async (): Promise<string> => jwtTokenMock);
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

		it('should call signAsync method to sign JWT token', async (): Promise<void> => {
			await jwtTokensService.generateRefreshToken(jwtPayloadMock);

			expect(signAsyncMock).toHaveBeenCalled();
		});

		it('should return JWT token as string', async (): Promise<void> => {
			const jwt: string = await jwtTokensService.generateRefreshToken(jwtPayloadMock);

			expect(jwt).toBe(jwtTokenMock);
		});
	});
});
