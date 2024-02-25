import { UserShortDto } from '@DTO/users/UserShort.dto';
import { User } from '@Entities/User.entity';
import { UsersRepository } from '@Repositories/users.repository';
import { users } from '@TestMocks/UserShortDto/users';
import { DataSource } from 'typeorm';

describe('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	let resolvedValue: UserShortDto | null = null;

	const selectMock: jest.Mock = jest.fn().mockReturnThis();
	const fromMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const getOneMock: jest.Mock = jest
		.fn()
		.mockImplementation(async (): Promise<UserShortDto | null> => resolvedValue);

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
		usersRepository = new UsersRepository(dataSourceMock);
	});

	describe('getByField', (): void => {
		const usersMock: UserShortDto[] = [...users];
		const existingUserId: string = '1';
		const notExistingUserId: string = '5';
		const existingUserEmail: string = 'tony@mail.com';
		const notExistingUserEmail: string = 'bruce@mail.com';
		const existingUserNickname: string = 't.stark';
		const notExistingUserNickname: string = 'b.banner';

		beforeEach((): void => {
			resolvedValue = null;
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersRepository.getByField).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.getByField).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query and find user by id', async (): Promise<void> => {
			await usersRepository.getByField('id', existingUserId);

			expect(selectMock).toHaveBeenCalledTimes(1);
			expect(selectMock).toHaveBeenCalledWith('user');
			expect(fromMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledWith(User, 'user');
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('user.id = :fieldValue', {
				fieldValue: existingUserId,
			});
			expect(getOneMock).toHaveBeenCalledTimes(1);
		});

		it('should use queryBuilder to build query and find user by email', async (): Promise<void> => {
			await usersRepository.getByField('email', existingUserEmail);

			expect(selectMock).toHaveBeenCalledTimes(1);
			expect(selectMock).toHaveBeenCalledWith('user');
			expect(fromMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledWith(User, 'user');
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('user.email = :fieldValue', {
				fieldValue: existingUserEmail,
			});
			expect(getOneMock).toHaveBeenCalledTimes(1);
		});

		it('should use queryBuilder to build query and find user by nickname', async (): Promise<void> => {
			await usersRepository.getByField('nickname', existingUserNickname);

			expect(selectMock).toHaveBeenCalledTimes(1);
			expect(selectMock).toHaveBeenCalledWith('user');
			expect(fromMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledWith(User, 'user');
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('user.nickname = :fieldValue', {
				fieldValue: existingUserNickname,
			});
			expect(getOneMock).toHaveBeenCalledTimes(1);
		});

		it('should return founded user as instance of UserShortDto', async (): Promise<void> => {
			resolvedValue = usersMock.find((user: UserShortDto) => user.id === existingUserId) || null;

			const foundedUser: UserShortDto | null = await usersRepository.getByField(
				'id',
				existingUserId,
			);

			expect(foundedUser).toBeInstanceOf(UserShortDto);
		});

		it('should find user by id if it exist', async (): Promise<void> => {
			resolvedValue = usersMock.find((user: UserShortDto) => user.id === existingUserId) || null;

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
			resolvedValue =
				usersMock.find((user: UserShortDto) => user.email === existingUserEmail) || null;

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
			resolvedValue =
				usersMock.find((user: UserShortDto) => user.nickname === existingUserNickname) || null;

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
