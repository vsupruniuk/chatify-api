import { connectionSource } from '@DB/typeOrmConfig';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { User } from '@Entities/User.entity';
import { UsersRepository } from '@Repositories/users.repository';
import { users } from '@TestMocks/UserFullDto/users';
import { FindOneOptions } from 'typeorm';
import SpyInstance = jest.SpyInstance;

describe('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	beforeEach((): void => {
		usersRepository = new UsersRepository(connectionSource);
	});

	describe('getFullUserByField', (): void => {
		let findMock: SpyInstance;

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
			findMock = jest
				.spyOn(usersRepository, 'findOne')
				.mockImplementation(async (options: FindOneOptions): Promise<User | null> => {
					return (
						(usersMock.find((user: UserFullDto) => {
							if (options.where!['id']) {
								return user.id === options.where!['id'];
							}

							if (options.where!['email']) {
								return user.email === options.where!['email'];
							}

							if (options.where!['nickname']) {
								return user.nickname === options.where!['nickname'];
							}

							if (options.where!['passwordResetTokenId']) {
								return user.passwordResetTokenId === options.where!['passwordResetTokenId'];
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
			expect(usersRepository.getFullUserByField).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.getFullUserByField).toBeInstanceOf(Function);
		});

		it('should call findOne method for searching user by id, if id was passed as search field', async (): Promise<void> => {
			await usersRepository.getFullUserByField('id', existingUserId);

			expect(findMock).toHaveBeenCalledTimes(1);
			expect(findMock).toHaveBeenCalledWith({ where: { id: existingUserId } });
		});

		it('should call findOne method for searching user by email, if email was passed as search field', async (): Promise<void> => {
			await usersRepository.getFullUserByField('email', existingUserEmail);

			expect(findMock).toHaveBeenCalledTimes(1);
			expect(findMock).toHaveBeenCalledWith({ where: { email: existingUserEmail } });
		});

		it('should call findOne method for searching user by nickname, if nickname was passed as search field', async (): Promise<void> => {
			await usersRepository.getFullUserByField('nickname', existingUserNickname);

			expect(findMock).toHaveBeenCalledTimes(1);
			expect(findMock).toHaveBeenCalledWith({ where: { nickname: existingUserNickname } });
		});

		it('should call findOne method for searching user by passwordResetTokenId, if passwordResetTokenId was passed as search field', async (): Promise<void> => {
			await usersRepository.getFullUserByField(
				'passwordResetTokenId',
				existingPasswordResetTokenId,
			);

			expect(findMock).toHaveBeenCalledTimes(1);
			expect(findMock).toHaveBeenCalledWith({
				where: { passwordResetTokenId: existingPasswordResetTokenId },
			});
		});

		it('should return founded user as instance of UserFullDto', async (): Promise<void> => {
			const foundedUser: UserFullDto | null = await usersRepository.getFullUserByField(
				'id',
				existingUserId,
			);

			expect(foundedUser).toBeInstanceOf(UserFullDto);
		});

		it('should find user by id if it exist', async (): Promise<void> => {
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
