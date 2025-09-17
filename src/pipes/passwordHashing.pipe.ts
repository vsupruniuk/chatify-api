import { PipeTransform } from '@nestjs/common';
import { PasswordHelper } from '@helpers/password.helper';

interface IPasswordFields {
	password?: string;
	passwordConfirmation?: string;
}

export class PasswordHashingPipe implements PipeTransform {
	public async transform<T extends IPasswordFields>(value: T): Promise<T> {
		if (value.password) {
			value.password = await PasswordHelper.hashPassword(value.password);
		}

		if (value.passwordConfirmation) {
			value.passwordConfirmation = await PasswordHelper.hashPassword(value.passwordConfirmation);
		}

		return value;
	}
}
