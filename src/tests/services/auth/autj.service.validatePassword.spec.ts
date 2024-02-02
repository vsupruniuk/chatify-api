import { connectionSource } from '@DB/typeOrmConfig';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { AuthService } from '@Services/auth.service';
import * as bcrypt from 'bcrypt';
import SpyInstance = jest.SpyInstance;

describe('AuthService', (): void => {
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
