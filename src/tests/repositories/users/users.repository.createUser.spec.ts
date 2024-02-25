import { CreateUserDto } from '@DTO/users/CreateUser.dto';
import { User } from '@Entities/User.entity';

import { UsersRepository } from '@Repositories/users.repository';
import { DataSource, InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

describe('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	const insertMock: jest.Mock = jest.fn().mockReturnThis();
	const intoMock: jest.Mock = jest.fn().mockReturnThis();
	const valuesMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<InsertResult> => {
		return <InsertResult>{
			identifiers: <ObjectLiteral>[{ id: '1' }],
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
		usersRepository = new UsersRepository(dataSourceMock);
	});

	describe('createUser', (): void => {
		const id: string = '1';
		const user: CreateUserDto = {
			firstName: 'Bruce',
			lastName: 'Banner',
			nickname: 'b.banner',
			email: 'bruce@mail.com',
			password: 'qwerty1A',
			accountSettingsId: '01',
			OTPCodeId: '10',
		};

		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersRepository.createUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.createUser).toBeInstanceOf(Function);
		});

		it('should user queryBuilder to build query for creating user', async (): Promise<void> => {
			await usersRepository.createUser(user);

			expect(insertMock).toHaveBeenCalledTimes(1);
			expect(intoMock).toHaveBeenCalledTimes(1);
			expect(intoMock).toHaveBeenCalledWith(User);
			expect(valuesMock).toHaveBeenCalledTimes(1);
			expect(valuesMock).toHaveBeenCalledWith(user);
			expect(executeMock).toHaveBeenCalledTimes(1);
		});

		it('should return id of created user', async (): Promise<void> => {
			const userId: string = await usersRepository.createUser(user);

			expect(userId).toEqual(id);
		});
	});
});
