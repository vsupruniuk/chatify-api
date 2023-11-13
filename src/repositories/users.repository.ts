import { DataSource, Repository } from 'typeorm';
import { User } from '@Entities/User.entity';
import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UsersRepository extends Repository<User> implements IUsersRepository {
	constructor(private _dataSource: DataSource) {
		super(User, _dataSource.createEntityManager());
	}

	public async getById(id: string): Promise<UserShortDto | null> {
		const users: User[] = await this.find({
			where: { id },
		});

		return users[0]
			? plainToClass(UserShortDto, users[0], { excludeExtraneousValues: true })
			: null;
	}
}
