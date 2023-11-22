import { Inject, Injectable } from '@nestjs/common';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IStatusesRepository } from '@Interfaces/statuses/IStatusesRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';
import { plainToClass } from 'class-transformer';
import { CreateStatusDto } from '@DTO/statuses/CreateStatus.dto';
import * as bcrypt from 'bcrypt';
import { DateHelper } from '../helpers/date.helper';

@Injectable()
export class UsersService implements IUsersService {
	constructor(
		@Inject(CustomProviders.I_ACCOUNT_SETTINGS_REPOSITORY)
		private readonly _accountSettingsRepository: IAccountSettingsRepository,

		@Inject(CustomProviders.I_STATUSES_REPOSITORY)
		private readonly _statusesRepository: IStatusesRepository,

		@Inject(CustomProviders.I_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,
	) {}

	public async createUser(signupUserDto: SignupUserDto): Promise<UserShortDto> {
		const defaultStatus: CreateStatusDto = plainToClass(CreateStatusDto, <CreateStatusDto>{
			statusText: '',
			dateTime: DateHelper.dateTimeNow(),
		});

		const accountSettingsId: string = await this._accountSettingsRepository.createDefaultSettings();
		const statusId: string = await this._statusesRepository.createStatus(defaultStatus);
		const hashedPassword: string = await bcrypt.hash(
			signupUserDto.password,
			Number(process.env.PASSWORD_SALT_HASH_ROUNDS),
		);

		const userForCreation: CreateUserDto = plainToClass(CreateUserDto, <CreateUserDto>{
			...signupUserDto,
			accountSettingsId,
			statusId,
			password: hashedPassword,
		});

		const createdUserId: string = await this._usersRepository.createUser(userForCreation);
		return await this._usersRepository.getById(createdUserId);
	}
}
