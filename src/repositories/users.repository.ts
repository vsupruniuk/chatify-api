import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { AppLogger } from '@Logger/app.logger';
import { Injectable } from '@nestjs/common';
import { TUserFullGetFields } from '@Types/users/TUserFullGetFields';
import { TUserGetFields } from '@Types/users/TUserGetFields';

import { DataSource, InsertResult, UpdateResult } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { User } from '@Entities/User.entity';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';

@Injectable()
export class UsersRepository implements IUsersRepository {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(private readonly _dataSource: DataSource) {}

	public async getByField(
		fieldName: TUserGetFields,
		fieldValue: string,
	): Promise<UserShortDto | null> {
		const user: User | null = await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.where(`user.${fieldName} = :fieldValue`, { fieldValue })
			.getOne();

		this._logger.successfulDBQuery({
			method: this.getByField.name,
			repository: 'UsersRepository',
			data: user,
		});

		return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async getFullUserByField(
		fieldName: TUserFullGetFields,
		fieldValue: string,
	): Promise<UserFullDto | null> {
		const user: User | null = await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.where(`user.${fieldName} = :fieldValue`, { fieldValue })
			.getOne();

		this._logger.successfulDBQuery({
			method: this.getFullUserByField.name,
			repository: 'UsersRepository',
			data: user,
		});

		return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async createUser(user: CreateUserDto): Promise<string> {
		const result: InsertResult = await this._dataSource
			.createQueryBuilder()
			.insert()
			.into(User)
			.values(user)
			.execute();

		this._logger.successfulDBQuery({
			method: this.createUser.name,
			repository: 'UsersRepository',
			data: result,
		});

		return result.identifiers[0].id;
	}

	public async updateUser(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<boolean> {
		const updateResult: UpdateResult = await this._dataSource
			.createQueryBuilder()
			.update(User)
			.set(updateUserDto)
			.where('id = :userId', { userId })
			.execute();

		this._logger.successfulDBQuery({
			method: this.updateUser.name,
			repository: 'UsersRepository',
			data: updateResult,
		});

		return updateResult.affected ? updateResult.affected > 0 : false;
	}
}
