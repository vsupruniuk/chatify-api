import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { Injectable } from '@nestjs/common';
import { TUserFullGetFields } from '@Types/users/TUserFullGetFields';
import { TUserGetFields } from '@Types/users/TUserGetFields';

import { DataSource, InsertResult, Repository, UpdateResult } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { User } from '@Entities/User.entity';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';

@Injectable()
export class UsersRepository extends Repository<User> implements IUsersRepository {
	constructor(_dataSource: DataSource) {
		super(User, _dataSource.createEntityManager());
	}

	public async getByField(
		fieldName: TUserGetFields,
		fieldValue: string,
	): Promise<UserShortDto | null> {
		const user: User | null = await this.findOne({
			where: { [fieldName]: fieldValue },
		});

		return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async getFullUserByField(
		fieldName: TUserFullGetFields,
		fieldValue: string,
	): Promise<UserFullDto | null> {
		const user: User | null = await this.findOne({
			where: { [fieldName]: fieldValue },
		});

		return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async createUser(user: CreateUserDto): Promise<string> {
		const result: InsertResult = await this.insert(user);

		return result.identifiers[0].id;
	}

	public async updateUser(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<boolean> {
		const updateResult: UpdateResult = await this.update({ id: userId }, updateUserDto);

		return updateResult.affected ? updateResult.affected > 0 : false;
	}
}
