import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { UsersRepository } from '@repositories/users/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { UpdateAppUserRequestDto } from '@dtos/appUser/UpdateAppUserRequest.dto';

describe('Users repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let usersRepository: UsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, UsersRepository],
		}).compile();

		usersRepository = moduleFixture.get(UsersRepository);
	});

	describe('Update app user', (): void => {
		const expectedUser: User = users[3];

		const userIdMock: string = expectedUser.id;
		const updateAppUserDto: UpdateAppUserRequestDto = {
			about: 'Iron man',
			firstName: 'Tony',
			lastName: 'Stark',
			nickname: 't.stark',
		};

		beforeEach((): void => {
			queryBuilderMock.getOne.mockReturnValue(expectedUser);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder and create a query for updating user public information', async (): Promise<void> => {
			await usersRepository.updateAppUser(userIdMock, updateAppUserDto);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.update).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.update).toHaveBeenNthCalledWith(1, User);

			expect(queryBuilderMock.set).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.set).toHaveBeenNthCalledWith(1, updateAppUserDto);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'id = :id', { id: userIdMock });

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(1);
		});

		it('should use query builder and fetch updated user', async (): Promise<void> => {
			await usersRepository.updateAppUser(userIdMock, updateAppUserDto);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'user.accountSettings',
				'accountSettings',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(2, 'user.id = :id', {
				id: userIdMock,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should use a transaction to rollback all changes in case of any error', async (): Promise<void> => {
			await usersRepository.updateAppUser(userIdMock, updateAppUserDto);

			expect(queryBuilderMock.transaction).toHaveBeenCalledTimes(1);
		});

		it('should return user if it was successfully updated', async (): Promise<void> => {
			const user: User | null = await usersRepository.updateAppUser(userIdMock, updateAppUserDto);

			expect(user).toEqual(expectedUser);
		});

		it('should return null if user was not updated', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const user: User | null = await usersRepository.updateAppUser(userIdMock, updateAppUserDto);

			expect(user).toBeNull();
		});
	});
});
