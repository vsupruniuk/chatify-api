import { UserFullDto } from '@DTO/users/UserFull.dto';
import { User } from '@Entities/User.entity';
import { UsersRepository } from '@Repositories/users.repository';
import { users } from '@TestMocks/UserFullDto/users';
import { DataSource } from 'typeorm';

describe('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	let resolvedValue: UserFullDto | null = null;

	const selectMock: jest.Mock = jest.fn().mockReturnThis();
	const fromMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const getOneMock: jest.Mock = jest
		.fn()
		.mockImplementation(async (): Promise<UserFullDto | null> => resolvedValue);

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

	describe('getFullUserByField', (): void => {
		const usersMock: UserFullDto[] = [...users];
		const existingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
		const notExistingUserId: string = 'f16845d7-90af-4c29-8e1a-227c90b33852';
		const existingUserEmail: string = 'tony@mail.com';
		const notExistingUserEmail: string = 'bruce@mail.com';
		const existingUserNickname: string = 't.stark';
		const notExistingUserNickname: string = 'b.banner';
		const existingPasswordResetTokenId: string = '1';
		const notExistingPasswordResetTokenId: string = '5';

		beforeEach((): void => {
			resolvedValue = null;
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersRepository.getFullUserByField).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.getFullUserByField).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query and find user by id', async (): Promise<void> => {
			await usersRepository.getFullUserByField('id', existingUserId);

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
			await usersRepository.getFullUserByField('email', existingUserEmail);

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
			await usersRepository.getFullUserByField('nickname', existingUserNickname);

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

		it('should use queryBuilder to build query and find user by passwordResetTokenId', async (): Promise<void> => {
			await usersRepository.getFullUserByField(
				'passwordResetTokenId',
				existingPasswordResetTokenId,
			);

			expect(selectMock).toHaveBeenCalledTimes(1);
			expect(selectMock).toHaveBeenCalledWith('user');
			expect(fromMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledWith(User, 'user');
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('user.passwordResetTokenId = :fieldValue', {
				fieldValue: existingPasswordResetTokenId,
			});
			expect(getOneMock).toHaveBeenCalledTimes(1);
		});

		it('should return founded user as instance of UserFullDto', async (): Promise<void> => {
			resolvedValue = usersMock.find((user: UserFullDto) => user.id === existingUserId) || null;

			const foundedUser: UserFullDto | null = await usersRepository.getFullUserByField(
				'id',
				existingUserId,
			);

			expect(foundedUser).toBeInstanceOf(UserFullDto);
		});

		it('should find user by id if it exist', async (): Promise<void> => {
			resolvedValue = usersMock.find((user: UserFullDto) => user.id === existingUserId) || null;

			const foundedUser: UserFullDto | null = await usersRepository.getFullUserByField(
				'id',
				existingUserId,
			);

			expect(foundedUser?.id).toBe(existingUserId);
		});

		it('should return null if user with given id not exist', async (): Promise<void> => {
			const foundedUser: UserFullDto | null = await usersRepository.getFullUserByField(
				'id',
				notExistingUserId,
			);

			expect(foundedUser).toBeNull();
		});

		it('should find user by email if it exist', async (): Promise<void> => {
			resolvedValue =
				usersMock.find((user: UserFullDto) => user.email === existingUserEmail) || null;

			const foundedUser: UserFullDto | null = await usersRepository.getFullUserByField(
				'email',
				existingUserEmail,
			);

			expect(foundedUser?.email).toBe(existingUserEmail);
		});

		it('should return null if user with given email not exist', async (): Promise<void> => {
			const foundedUser: UserFullDto | null = await usersRepository.getFullUserByField(
				'email',
				notExistingUserEmail,
			);

			expect(foundedUser).toBeNull();
		});

		it('should find user by nickname if it exist', async (): Promise<void> => {
			resolvedValue =
				usersMock.find((user: UserFullDto) => user.nickname === existingUserNickname) || null;

			const foundedUser: UserFullDto | null = await usersRepository.getFullUserByField(
				'nickname',
				existingUserNickname,
			);

			expect(foundedUser?.nickname).toBe(existingUserNickname);
		});

		it('should return null if user with given nickname not exist', async (): Promise<void> => {
			const foundedUser: UserFullDto | null = await usersRepository.getFullUserByField(
				'nickname',
				notExistingUserNickname,
			);

			expect(foundedUser).toBeNull();
		});

		it('should find user by passwordResetTokenId if it exist', async (): Promise<void> => {
			resolvedValue =
				usersMock.find(
					(user: UserFullDto) => user.passwordResetTokenId === existingPasswordResetTokenId,
				) || null;

			const foundedUser: UserFullDto | null = await usersRepository.getFullUserByField(
				'passwordResetTokenId',
				existingPasswordResetTokenId,
			);

			expect(foundedUser?.passwordResetTokenId).toBe(existingPasswordResetTokenId);
		});

		it('should return null if user with given passwordResetTokenId not exist', async (): Promise<void> => {
			const foundedUser: UserFullDto | null = await usersRepository.getFullUserByField(
				'passwordResetTokenId',
				notExistingPasswordResetTokenId,
			);

			expect(foundedUser).toBeNull();
		});
	});
});
