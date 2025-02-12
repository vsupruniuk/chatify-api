import { PipeTransform } from '@nestjs/common';
import { PasswordHelper } from '@helpers/password.helper';

interface PasswordFields {
	password?: string;
	passwordConfirmation?: string;
}

export class PasswordHashingPipe implements PipeTransform {
	public async transform<T extends PasswordFields>(value: T): Promise<T> {
		if (value.password) {
			value.password = await PasswordHelper.hashPassword(value.password);
		}

		if (value.passwordConfirmation) {
			value.passwordConfirmation = await PasswordHelper.hashPassword(value.passwordConfirmation);
		}

		return value;
	}
}
