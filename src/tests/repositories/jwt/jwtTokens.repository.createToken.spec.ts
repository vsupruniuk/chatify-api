import { JWTToken } from '@Entities/JWTToken.entity';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { DataSource, InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

describe('jwtTokensRepository', (): void => {
	let jwtTokensRepository: JWTTokensRepository;

	const insertMock: jest.Mock = jest.fn().mockReturnThis();
	const intoMock: jest.Mock = jest.fn().mockReturnThis();
	const valuesMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<InsertResult> => {
		return <InsertResult>{
			identifiers: <ObjectLiteral>[{ id: '4' }],
		};
	});

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				insert: insertMock,
				into: intoMock,
				values: valuesMock,
				execute: executeMock,
			};
		}),
	};

	beforeEach((): void => {
		jwtTokensRepository = new JWTTokensRepository(dataSourceMock);
	});

	describe('createToken', (): void => {
		const id: string = '4';
		const token: string = 'jwt-token-4';

		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(jwtTokensRepository.createToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensRepository.createToken).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query for creating JWT token', async (): Promise<void> => {
			await jwtTokensRepository.createToken(token);

			expect(insertMock).toHaveBeenCalledTimes(1);
			expect(intoMock).toHaveBeenCalledTimes(1);
			expect(intoMock).toHaveBeenCalledWith(JWTToken);
			expect(valuesMock).toHaveBeenCalledTimes(1);
			expect(valuesMock).toHaveBeenCalledWith({ token });
			expect(executeMock).toHaveBeenCalledTimes(1);
		});

		it('should return id of created token', async (): Promise<void> => {
			const tokenId: string = await jwtTokensRepository.createToken(token);

			expect(tokenId).toEqual(id);
		});
	});
});
