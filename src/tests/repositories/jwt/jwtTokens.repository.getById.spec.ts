import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { JWTToken } from '@Entities/JWTToken.entity';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { jwtTokens } from '@TestMocks/JWTTokenFullDto/jwtTokens';
import { DataSource } from 'typeorm';

describe('jwtTokensRepository', (): void => {
	let jwtTokensRepository: JWTTokensRepository;

	let resolvedValue: JWTTokenFullDto | null = null;

	const selectMock: jest.Mock = jest.fn().mockReturnThis();
	const fromMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const getOneMock: jest.Mock = jest
		.fn()
		.mockImplementation(async (): Promise<JWTTokenFullDto | null> => resolvedValue);

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				select: selectMock,
				from: fromMock,
				where: whereMock,
				getOne: getOneMock,
			};
		}),
	};

	beforeEach((): void => {
		jwtTokensRepository = new JWTTokensRepository(dataSourceMock);
	});

	describe('getById', () => {
		const jwtTokensMock: JWTTokenFullDto[] = [...jwtTokens];
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';

		beforeEach((): void => {
			resolvedValue = null;
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(jwtTokensRepository.getById).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensRepository.getById).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query and find JWT token by id', async (): Promise<void> => {
			await jwtTokensRepository.getById(existingTokenId);

			expect(selectMock).toHaveBeenCalledTimes(1);
			expect(selectMock).toHaveBeenCalledWith('jwtToken');
			expect(fromMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledWith(JWTToken, 'jwtToken');
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('jwtToken.id = :id', {
				id: existingTokenId,
			});
			expect(getOneMock).toHaveBeenCalledTimes(1);
		});

		it('should find token, if it exist', async (): Promise<void> => {
			resolvedValue =
				jwtTokensMock.find((token: JWTTokenFullDto) => token.id === existingTokenId) || null;

			const foundedToken: JWTTokenFullDto | null =
				await jwtTokensRepository.getById(existingTokenId);

			expect(foundedToken?.id).toEqual(existingTokenId);
		});

		it('should return founded token as instance of JWTTokenFullDto', async (): Promise<void> => {
			resolvedValue =
				jwtTokensMock.find((token: JWTTokenFullDto) => token.id === existingTokenId) || null;

			const foundedToken: JWTTokenFullDto | null =
				await jwtTokensRepository.getById(existingTokenId);

			expect(foundedToken).toBeInstanceOf(JWTTokenFullDto);
		});

		it('should return null, if token not exist', async (): Promise<void> => {
			const foundedToken: JWTTokenFullDto | null =
				await jwtTokensRepository.getById(notExistingTokenId);

			expect(foundedToken).toBeNull();
		});
	});
});
