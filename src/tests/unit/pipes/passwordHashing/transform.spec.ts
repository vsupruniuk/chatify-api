import { Test, TestingModule } from '@nestjs/testing';

import { PasswordHashingPipe } from '@pipes';

import { PasswordHelper } from '@helpers';

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

		const password: string = 'Qwerty12345!';
		const passwordConfirmation: string = 'Qwerty12345!';

		beforeEach((): void => {
			jest.spyOn(PasswordHelper, 'hashPassword').mockResolvedValue(hashedPasswordMock);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call hash password method from password helper with password and password confirmation fields', async (): Promise<void> => {
			await passwordHashingPipe.transform({ password, passwordConfirmation });

			expect(PasswordHelper.hashPassword).toHaveBeenCalledTimes(2);
			expect(PasswordHelper.hashPassword).toHaveBeenNthCalledWith(1, password);
			expect(PasswordHelper.hashPassword).toHaveBeenNthCalledWith(2, passwordConfirmation);
		});

		it('should return hashed values in password fields', async (): Promise<void> => {
			const result = await passwordHashingPipe.transform({ password, passwordConfirmation });

			expect(result.password).not.toBe(password);
			expect(result.passwordConfirmation).not.toBe(passwordConfirmation);
		});
	});
});
