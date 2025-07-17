import * as bcrypt from 'bcrypt';
import { PasswordHelper } from '@helpers/password.helper';

describe('Password helper', (): void => {
	const passwordSaltHashRoundsMock: string = '7';

	beforeAll((): void => {
		process.env.PASSWORD_SALT_HASH_ROUNDS = passwordSaltHashRoundsMock;
	});

	afterAll((): void => {
		delete process.env.PASSWORD_SALT_HASH_ROUNDS;
	});

	describe('Hash password', (): void => {
		const rawPassword: string = 'Qwerty12345!';
		const passwordHashMock: string = 'passwordHashMock';

		beforeEach((): void => {
			jest.spyOn(bcrypt, 'hash').mockImplementation(async () => passwordHashMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(PasswordHelper.hashPassword).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(PasswordHelper.hashPassword).toBeInstanceOf(Function);
		});

		it('should call hash method from bcrypt package to hash the password', async (): Promise<void> => {
			await PasswordHelper.hashPassword(rawPassword);

			expect(bcrypt.hash).toHaveBeenCalledTimes(1);
			expect(bcrypt.hash).toHaveBeenNthCalledWith(
				1,
				rawPassword,
				Number(passwordSaltHashRoundsMock),
			);
		});

		it('should return hashed password', async (): Promise<void> => {
			const hashedPassword: string = await PasswordHelper.hashPassword(rawPassword);

			expect(hashedPassword).toBe(passwordHashMock);
		});
	});
});
