import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { User } from '@entities/User.entity';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { users } from '@testMocks/User/users';
import { DataSource } from 'typeorm';
import { UsersRepository } from '@repositories/users/users.repository';

describe.skip('usersRepository', (): void => {
	let queryBuilderMock: QueryBuilderMock<never>;
	let usersRepository: IUsersRepository;

	const usersMock: User[] = [...users];
	const existingUserEmail: string = usersMock[2].email;
	const existingUserNickname: string = usersMock[3].nickname;
	const nonExistingUserEmail: string = 'tanos@avengers.com';
	const nonExistingUserNickname: string = 'tanos';

	const context: {
		whereValue: string;
		orWhereValue: string;
	} = {
		whereValue: '',
		orWhereValue: '',
	};

	beforeAll((): void => {
		queryBuilderMock = new QueryBuilderMock();

		queryBuilderMock.where.mockImplementation((_, config: { email: string }) => {
			if (config) {
				context.whereValue = config.email;
			}

			return queryBuilderMock;
		});

		queryBuilderMock.orWhere.mockImplementation((_, config: { nickname: string }) => {
			if (config) {
				context.orWhereValue = config.nickname;
			}

			return queryBuilderMock;
		});

		queryBuilderMock.getOne.mockImplementation(
			() =>
				usersMock.find(
					(user: User) =>
						user.email === context.whereValue || user.nickname === context.orWhereValue,
				) || null,
		);

		const dataSourceMock: jest.Mocked<Partial<DataSource>> = queryBuilderMock;

		usersRepository = new UsersRepository(dataSourceMock as DataSource);
	});

	describe('getByEmailOrNickname', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersRepository.getByEmailOrNickname).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.getByEmailOrNickname).toBeInstanceOf(Function);
		});

		it('should create query for searching user by email or nickname', async (): Promise<void> => {
			await usersRepository.getByEmailOrNickname(existingUserEmail, existingUserNickname);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(4);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'user.accountSettings',
				'accountSettings',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				2,
				'user.OTPCode',
				'OTPCode',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				3,
				'user.JWTToken',
				'JWTToken',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				4,
				'user.passwordResetToken',
				'passwordResetToken',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'user.email = :email', {
				email: existingUserEmail,
			});

			expect(queryBuilderMock.orWhere).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.orWhere).toHaveBeenNthCalledWith(1, 'user.nickname = :nickname', {
				nickname: existingUserNickname,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should return user by email if its exist', async (): Promise<void> => {
			const user: User | null = await usersRepository.getByEmailOrNickname(
				existingUserEmail,
				nonExistingUserNickname,
			);

			expect(user?.email).toBe(existingUserEmail);
		});

		it('should return user by nickname if its exist', async (): Promise<void> => {
			const user: User | null = await usersRepository.getByEmailOrNickname(
				nonExistingUserEmail,
				existingUserNickname,
			);

			expect(user?.nickname).toBe(existingUserNickname);
		});

		it('should return null if user with such email or nickname does not exist', async (): Promise<void> => {
			const user: User | null = await usersRepository.getByEmailOrNickname(
				nonExistingUserEmail,
				nonExistingUserNickname,
			);

			expect(user).toBeNull();
		});

		it('should return user as instance of User', async (): Promise<void> => {
			const user: User | null = await usersRepository.getByEmailOrNickname(
				existingUserEmail,
				existingUserNickname,
			);

			expect(user).toBeInstanceOf(User);
		});
	});
});
