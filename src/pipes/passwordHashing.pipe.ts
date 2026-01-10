import { PipeTransform } from '@nestjs/common';

import { PasswordHelper } from '@helpers';

interface IPasswordFields {
	password?: string;
	passwordConfirmation?: string;
}

export class PasswordHashingPipe implements PipeTransform {
	public async transform<V extends IPasswordFields>(value: V): Promise<V> {
		if (value.password) {
			value.password = await PasswordHelper.hashPassword(value.password);
		}

		if (value.passwordConfirmation) {
			value.passwordConfirmation = await PasswordHelper.hashPassword(value.passwordConfirmation);
		}

		return value;
	}
}
