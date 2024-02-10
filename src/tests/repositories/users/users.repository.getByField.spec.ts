import { connectionSource } from '@DB/typeOrmConfig';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { User } from '@Entities/User.entity';
import { UsersRepository } from '@Repositories/users.repository';
import { users } from '@TestMocks/UserShortDto/users';
import { FindOneOptions } from 'typeorm';
import SpyInstance = jest.SpyInstance;

describe('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	beforeEach((): void => {
		usersRepository = new UsersRepository(connectionSource);
	});

	describe('getByField', (): void => {
		let findMock: SpyInstance;

		const usersMock: UserShortDto[] = [...users];
		const existingUserId: string = '1';
		const notExistingUserId: string = '5';
		const existingUserEmail: string = 'tony@mail.com';
		const notExistingUserEmail: string = 'bruce@mail.com';
		const existingUserNickname: string = 't.stark';
		const notExistingUserNickname: string = 'b.banner';

		beforeEach((): void => {
			findMock = jest
				.spyOn(usersRepository, 'findOne')
				.mockImplementation(async (options: FindOneOptions): Promise<User | null> => {
					return (
						(usersMock.find((user: UserShortDto) => {
							if (options.where!['id']) {
								return user.id === options.where!['id'];
							}

							if (options.where!['email']) {
								return user.email === options.where!['email'];
							}

							if (options.where!['nickname']) {
								return user.nickname === options.where!['nickname'];
							}

							return false;
						}) as User) || null
					);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersRepository.getByField).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.getByField).toBeInstanceOf(Function);
		});

		it('should call findOne method for searching user by id, if id was passed as search field', async (): Promise<void> => {
			await usersRepository.getByField('id', existingUserId);

			expect(findMock).toHaveBeenCalledTimes(1);
			expect(findMock).toHaveBeenCalledWith({ where: { id: existingUserId } });
		});

		it('should call findOne method for searching user by email, if email was passed as search field', async (): Promise<void> => {
			await usersRepository.getByField('email', existingUserEmail);

			expect(findMock).toHaveBeenCalledTimes(1);
			expect(findMock).toHaveBeenCalledWith({ where: { email: existingUserEmail } });
		});

		it('should call findOne method for searching user by nickname, if nickname was passed as search field', async (): Promise<void> => {
			await usersRepository.getByField('nickname', existingUserNickname);

			expect(findMock).toHaveBeenCalledTimes(1);
			expect(findMock).toHaveBeenCalledWith({ where: { nickname: existingUserNickname } });
		});

		it('should return founded user as instance of UserShortDto', async (): Promise<void> => {
			const foundedUser: UserShortDto | null = await usersRepository.getByField(
				'id',
				existingUserId,
			);

			expect(foundedUser).toBeInstanceOf(UserShortDto);
		});

		it('should find user by id if it exist', async (): Promise<void> => {
			const foundedUser: UserShortDto | null = await usersRepository.getByField(
				'id',
				existingUserId,
			);

			expect(foundedUser?.id).toBe(existingUserId);
		});

		it('should return null if user with given id not exist', async (): Promise<void> => {
			const foundedUser: UserShortDto | null = await usersRepository.getByField(
				'id',
				notExistingUserId,
			);

			expect(foundedUser).toBeNull();
		});

		it('should find user by email if it exist', async (): Promise<void> => {
			const foundedUser: UserShortDto | null = await usersRepository.getByField(
				'email',
				existingUserEmail,
			);

			expect(foundedUser?.email).toBe(existingUserEmail);
		});

		it('should return null if user with given email not exist', async (): Promise<void> => {
			const foundedUser: UserShortDto | null = await usersRepository.getByField(
				'email',
				notExistingUserEmail,
			);

			expect(foundedUser).toBeNull();
		});

		it('should find user by nickname if it exist', async (): Promise<void> => {
			const foundedUser: UserShortDto | null = await usersRepository.getByField(
				'nickname',
				existingUserNickname,
			);

			expect(foundedUser?.nickname).toBe(existingUserNickname);
		});

		it('should return null if user with given nickname not exist', async (): Promise<void> => {
			const foundedUser: UserShortDto | null = await usersRepository.getByField(
				'nickname',
				notExistingUserNickname,
			);

			expect(foundedUser).toBeNull();
		});
	});
});
