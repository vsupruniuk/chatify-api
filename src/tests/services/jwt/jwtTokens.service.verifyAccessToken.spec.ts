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

	describe('verifyAccessToken', (): void => {
		let verifyAsyncMock: SpyInstance;

		const validJwtToken: string = 'validJwtToken';
		const invalidJwtToken: string = 'invalidJwtToken';
		const jwtPayloadMock: JWTPayloadDto = {
			id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
			email: 'tony@mail.com',
			firstName: 'Tony',
			lastName: 'Stark',
			nickname: 't.stark',
		};

		beforeEach((): void => {
			verifyAsyncMock = jest
				.spyOn(jwtService, 'verifyAsync')
				.mockImplementation(async (token: string): Promise<object> => {
					if (token === validJwtToken) {
						return jwtPayloadMock;
					}

					throw new Error();
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(jwtTokensService.verifyAccessToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensService.verifyAccessToken).toBeInstanceOf(Function);
		});

		it('should call verifyAsync method to verify JWT token', async (): Promise<void> => {
			await jwtTokensService.verifyAccessToken(validJwtToken);

			expect(verifyAsyncMock).toHaveBeenCalledTimes(1);
			expect(verifyAsyncMock).toHaveBeenCalledWith(validJwtToken, {
				secret: process.env.JWT_ACCESS_TOKEN_SECRET,
			});
		});

		it('should return user data if JWT token valid', async (): Promise<void> => {
			const data: JWTPayloadDto | null = await jwtTokensService.verifyAccessToken(validJwtToken);

			expect(data?.id).toBe(jwtPayloadMock.id);
			expect(data?.email).toBe(jwtPayloadMock.email);
			expect(data?.firstName).toBe(jwtPayloadMock.firstName);
			expect(data?.lastName).toBe(jwtPayloadMock.lastName);
			expect(data?.nickname).toBe(jwtPayloadMock.nickname);
		});

		it('should return null if JWT token invalid', async (): Promise<void> => {
			const data: JWTPayloadDto | null = await jwtTokensService.verifyAccessToken(invalidJwtToken);

			expect(data).toBeNull();
		});
	});
});
