import { InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

import { connectionSource } from '@DB/typeOrmConfig';

import { CreateUserDto } from '@DTO/users/CreateUser.dto';

import { UsersRepository } from '@Repositories/users.repository';

import SpyInstance = jest.SpyInstance;

describe('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	beforeEach((): void => {
		usersRepository = new UsersRepository(connectionSource);
	});

	describe('createUser', (): void => {
		let insertMock: SpyInstance;
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
			insertMock = jest.spyOn(usersRepository, 'insert').mockResolvedValue(
				Promise.resolve(<InsertResult>{
					identifiers: <ObjectLiteral>[{ id }],
				}),
			);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersRepository.createUser).toBeDefined();
		});

		it('should use insert method for creating user', async (): Promise<void> => {
			await usersRepository.createUser(user);

			expect(insertMock).toHaveBeenCalledWith(user);
		});

		it('should return id of created user', async (): Promise<void> => {
			const userId: string = await usersRepository.createUser(user);

			expect(userId).toEqual(id);
		});
	});
});
