import { UsersRepository } from '@repositories/users/users.repository';
import { User } from '@entities/User.entity';
import { DataSource } from 'typeorm';
import { users } from '@testMocks/User/users';

describe.skip('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	let resolvedValue: User | null = null;

	const selectMock: jest.Mock = jest.fn().mockReturnThis();
	const fromMock: jest.Mock = jest.fn().mockReturnThis();
	const leftJoinAndSelectMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const getOneMock: jest.Mock = jest
		.fn()
		.mockImplementation(async (): Promise<User | null> => resolvedValue);

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				select: selectMock,
				from: fromMock,
				leftJoinAndSelect: leftJoinAndSelectMock,
				where: whereMock,
				getOne: getOneMock,
			};
		}),
	};

	beforeEach((): void => {
		usersRepository = new UsersRepository(dataSourceMock);
	});

	describe('getByField', (): void => {
		const usersMock: User[] = [...users];
		const existingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
		const notExistingUserId: string = 'f41845d7-90af-4c29-8e1a-227c90b31152';
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
			expect(leftJoinAndSelectMock).toHaveBeenCalledTimes(4);
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(
				1,
				'user.accountSettings',
				'accountSettings',
			);
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(2, 'user.OTPCode', 'OTPCode');
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(3, 'user.JWTToken', 'JWTToken');
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(
				4,
				'user.passwordResetToken',
				'passwordResetToken',
			);
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
			expect(leftJoinAndSelectMock).toHaveBeenCalledTimes(4);
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(
				1,
				'user.accountSettings',
				'accountSettings',
			);
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(2, 'user.OTPCode', 'OTPCode');
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(3, 'user.JWTToken', 'JWTToken');
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(
				4,
				'user.passwordResetToken',
				'passwordResetToken',
			);
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
			expect(leftJoinAndSelectMock).toHaveBeenCalledTimes(4);
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(
				1,
				'user.accountSettings',
				'accountSettings',
			);
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(2, 'user.OTPCode', 'OTPCode');
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(3, 'user.JWTToken', 'JWTToken');
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(
				4,
				'user.passwordResetToken',
				'passwordResetToken',
			);
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('user.nickname = :fieldValue', {
				fieldValue: existingUserNickname,
			});
			expect(getOneMock).toHaveBeenCalledTimes(1);
		});

		it('should return founded user as instance of User', async (): Promise<void> => {
			resolvedValue = usersMock.find((user: User) => user.id === existingUserId) || null;

			const foundedUser: User | null = await usersRepository.getByField('id', existingUserId);

			expect(foundedUser).toBeInstanceOf(User);
		});

		it('should find user by id if it exist', async (): Promise<void> => {
			resolvedValue = usersMock.find((user: User) => user.id === existingUserId) || null;

			const foundedUser: User | null = await usersRepository.getByField('id', existingUserId);

			expect(foundedUser?.id).toBe(existingUserId);
		});

		it('should return null if user with given id not exist', async (): Promise<void> => {
			const foundedUser: User | null = await usersRepository.getByField('id', notExistingUserId);

			expect(foundedUser).toBeNull();
		});

		it('should find user by email if it exist', async (): Promise<void> => {
			resolvedValue = usersMock.find((user: User) => user.email === existingUserEmail) || null;

			const foundedUser: User | null = await usersRepository.getByField('email', existingUserEmail);

			expect(foundedUser?.email).toBe(existingUserEmail);
		});

		it('should return null if user with given email not exist', async (): Promise<void> => {
			const foundedUser: User | null = await usersRepository.getByField(
				'email',
				notExistingUserEmail,
			);

			expect(foundedUser).toBeNull();
		});

		it('should find user by nickname if it exist', async (): Promise<void> => {
			resolvedValue =
				usersMock.find((user: User) => user.nickname === existingUserNickname) || null;

			const foundedUser: User | null = await usersRepository.getByField(
				'nickname',
				existingUserNickname,
			);

			expect(foundedUser?.nickname).toBe(existingUserNickname);
		});

		it('should return null if user with given nickname not exist', async (): Promise<void> => {
			const foundedUser: User | null = await usersRepository.getByField(
				'nickname',
				notExistingUserNickname,
			);

			expect(foundedUser).toBeNull();
		});
	});
});
