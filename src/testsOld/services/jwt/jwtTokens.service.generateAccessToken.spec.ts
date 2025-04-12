import { JwtTokensService } from '@services/jwt/jwtTokens.service';
import { JwtService } from '@nestjs/jwt';
import { JwtTokensRepository } from '@repositories/jwtTokens/jwtTokens.repository';
import { connectionSource } from '@db/typeOrmConfig';
import SpyInstance = jest.SpyInstance;
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';

describe.skip('jwtTokensService', (): void => {
	let jwtTokensService: JwtTokensService;
	const jwtService: JwtService = new JwtService();

	beforeEach((): void => {
		const jwtTokensRepository: JwtTokensRepository = new JwtTokensRepository(connectionSource);

		jwtTokensService = new JwtTokensService(jwtService, jwtTokensRepository);
	});

	describe('generateAccessToken', (): void => {
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
			expect(jwtTokensService.generateAccessToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensService.generateAccessToken).toBeInstanceOf(Function);
		});

		it('should call signAsync method to sign JWT token', async (): Promise<void> => {
			await jwtTokensService.generateAccessToken(jwtPayloadMock);

			expect(signAsyncMock).toHaveBeenCalledTimes(1);
			expect(signAsyncMock).toHaveBeenCalledWith(jwtPayloadMock, {
				secret: process.env.JWT_ACCESS_TOKEN_SECRET,
				expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN),
			});
		});

		it('should return JWT token as string', async (): Promise<void> => {
			const jwt: string = await jwtTokensService.generateAccessToken(jwtPayloadMock);

			expect(jwt).toBe(jwtTokenMock);
		});
	});
});
