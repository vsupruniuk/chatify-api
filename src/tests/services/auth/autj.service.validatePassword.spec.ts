import { IOTPCodesRepository } from '@repositories/otpCode/IOTPCodesRepository';
import { IAuthService } from '@services/auth/IAuthService';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { OTPCodesRepository } from '@repositories/otpCode/OTPCodes.repository';
import { connectionSource } from '@db/typeOrmConfig';
import { UsersRepository } from '@repositories/users/users.repository';
import { AuthService } from '@services/auth/auth.service';
import SpyInstance = jest.SpyInstance;
import * as bcrypt from 'bcrypt';

describe.skip('AuthService', (): void => {
	let authService: IAuthService;
	let otpCodesRepository: IOTPCodesRepository;
	let usersRepository: IUsersRepository;

	beforeEach((): void => {
		otpCodesRepository = new OTPCodesRepository(connectionSource);
		usersRepository = new UsersRepository(connectionSource);

		authService = new AuthService(otpCodesRepository, usersRepository);
	});

	describe('validatePassword', (): void => {
		let compareMock: SpyInstance;

		const password: string = 'password';

		beforeEach((): void => {
			compareMock = jest
				.spyOn(bcrypt, 'compare')
				.mockImplementation(async (data: string | Buffer, encrypted: string): Promise<boolean> => {
					return data === encrypted;
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(authService.validatePassword).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authService.validatePassword).toBeInstanceOf(Function);
		});

		it('should call compare method from bcrypt to check if user password valid', async (): Promise<void> => {
			await authService.validatePassword(password, password);

			expect(compareMock).toHaveBeenCalledTimes(1);
			expect(compareMock).toHaveBeenCalledWith(password, password);
		});

		it('should return true if user password valid', async (): Promise<void> => {
			const isValid: boolean = await authService.validatePassword(password, password);

			expect(isValid).toBe(true);
		});

		it('should return false if user password invalid', async (): Promise<void> => {
			const isValid: boolean = await authService.validatePassword('invalid-password', password);

			expect(isValid).toBe(false);
		});
	});
});
