import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHashingPipe } from '@pipes/passwordHashing.pipe';
import { PasswordHelper } from '@helpers/password.helper';

describe('Password hashing pipe', (): void => {
	let passwordHashingPipe: PasswordHashingPipe;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [PasswordHashingPipe],
		}).compile();

		passwordHashingPipe = moduleFixture.get(PasswordHashingPipe);
	});

	describe('Transform', (): void => {
		const hashedPasswordMock: string = 'hashedPasswordMock';

		const password = 'Qwerty12345!';
		const passwordConfirmation = 'Qwerty12345!';

		beforeEach((): void => {
			jest.spyOn(PasswordHelper, 'hashPassword').mockResolvedValue(hashedPasswordMock);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call hash password method from password helper with password field if it present in object', async (): Promise<void> => {
			await passwordHashingPipe.transform({ password });

			expect(PasswordHelper.hashPassword).toHaveBeenCalledTimes(1);
			expect(PasswordHelper.hashPassword).toHaveBeenNthCalledWith(1, password);
		});

		it('should call hash password method from password helper with password confirmation field if it present in object', async (): Promise<void> => {
			await passwordHashingPipe.transform({ passwordConfirmation });

			expect(PasswordHelper.hashPassword).toHaveBeenCalledTimes(1);
			expect(PasswordHelper.hashPassword).toHaveBeenNthCalledWith(1, passwordConfirmation);
		});

		it('should return the same object with hashed password and password confirmation if they are present', async (): Promise<void> => {
			const passwords = { password, passwordConfirmation };

			await passwordHashingPipe.transform(passwords);

			expect(passwords.password).toBe(hashedPasswordMock);
			expect(passwords.passwordConfirmation).toBe(hashedPasswordMock);
		});
	});
});
