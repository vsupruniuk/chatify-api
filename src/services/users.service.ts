import { Inject, Injectable } from '@nestjs/common';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';

@Injectable()
export class UsersService {
	constructor(
		@Inject(CustomProviders.I_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,
	) {}

	test(user: CreateUserDto) {
		return this._usersRepository.createUser(user);
	}
}
