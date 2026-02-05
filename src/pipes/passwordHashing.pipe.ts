import { PipeTransform } from '@nestjs/common';

import { PasswordHelper } from '@helpers';

interface IPasswordFields {
	password: string;
	passwordConfirmation: string;
}

/**
 * Pipe for hashing user passwords in DTO where the password or password confirmation field exist
 * Returns the same DTO object with hashed passwords
 */
export class PasswordHashingPipe implements PipeTransform {
	public async transform<V extends IPasswordFields>(value: V): Promise<V> {
		return {
			...value,
			password: await PasswordHelper.hashPassword(value.password),
			passwordConfirmation: await PasswordHelper.hashPassword(value.passwordConfirmation),
		};
	}
}
