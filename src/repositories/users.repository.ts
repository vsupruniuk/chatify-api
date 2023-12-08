import { Injectable } from '@nestjs/common';

import { DataSource, InsertResult, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { User } from '@Entities/User.entity';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';

@Injectable()
export class UsersRepository extends Repository<User> implements IUsersRepository {
	constructor(private _dataSource: DataSource) {
		super(User, _dataSource.createEntityManager());
	}

	public async getById(id: string): Promise<UserShortDto | null> {
		const user: User | null = await this.findOne({
			where: { id },
		});

		return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async getByEmail(email: string): Promise<UserShortDto | null> {
		const user: User | null = await this.findOne({ where: { email } });

		return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async getByNickname(nickname: string): Promise<UserShortDto | null> {
		const user: User | null = await this.findOne({ where: { nickname } });

		return user ? plainToInstance(UserShortDto, user, { excludeExtraneousValues: true }) : null;
	}

	public async createUser(user: CreateUserDto): Promise<string> {
		const result: InsertResult = await this.insert(user);

		return result.identifiers[0].id;
	}
}
