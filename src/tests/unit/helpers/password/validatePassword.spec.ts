import * as bcrypt from 'bcrypt';
import { PasswordHelper } from '@helpers/password.helper';

describe('Password helper', (): void => {
	describe('Validate password', (): void => {
		const password: string = 'Qwerty12345!';
		const encryptedPassword: string = 'encryptedPassword';

		beforeEach((): void => {
			jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(PasswordHelper.validatePassword).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(PasswordHelper.validatePassword).toBeInstanceOf(Function);
		});

		it('should call compare method from bcrypt package to validate the password', async (): Promise<void> => {
			await PasswordHelper.validatePassword(password, encryptedPassword);

			expect(bcrypt.compare).toHaveBeenCalledTimes(1);
			expect(bcrypt.compare).toHaveBeenNthCalledWith(1, password, encryptedPassword);
		});

		it('should return true if password valid', async (): Promise<void> => {
			const isValid: boolean = await PasswordHelper.validatePassword(password, encryptedPassword);

			expect(isValid).toBe(true);
		});

		it('should return false if password is not valid', async (): Promise<void> => {
			jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

			const isValid: boolean = await PasswordHelper.validatePassword(password, encryptedPassword);

			expect(isValid).toBe(false);
		});
	});
});
