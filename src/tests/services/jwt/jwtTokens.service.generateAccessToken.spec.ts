import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtTokensService } from '@Services/jwtTokens.service';
import SpyInstance = jest.SpyInstance;

describe('jwtTokensService', (): void => {
	let jwtTokensServiceMock: JwtTokensService;
	const jwtService: JwtService = new JwtService();

	beforeEach((): void => {
		jwtTokensServiceMock = new JwtTokensService(jwtService);
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
			expect(jwtTokensServiceMock.generateAccessToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensServiceMock.generateAccessToken).toBeInstanceOf(Function);
		});

		it('should call signAsync method to sign JWT token', async (): Promise<void> => {
			await jwtTokensServiceMock.generateAccessToken(jwtPayloadMock);

			expect(signAsyncMock).toHaveBeenCalled();
		});

		it('should return JWT token as string', async (): Promise<void> => {
			const jwt: string = await jwtTokensServiceMock.generateAccessToken(jwtPayloadMock);

			expect(jwt).toBe(jwtTokenMock);
		});
	});
});
