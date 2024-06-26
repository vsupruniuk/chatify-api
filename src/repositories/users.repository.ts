import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { AppLogger } from '@Logger/app.logger';
import { Injectable } from '@nestjs/common';
import { TUserGetFields } from '@Types/users/TUserGetFields';
import { DataSource, InsertResult, UpdateResult } from 'typeorm';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { User } from '@Entities/User.entity';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';

@Injectable()
export class UsersRepository implements IUsersRepository {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(private readonly _dataSource: DataSource) {}

	public async getPublicUsers(nickname: string, skip: number, take: number): Promise<User[]> {
		const users: User[] = await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.where('user.nickname LIKE :nickname', { nickname: `%${nickname}%` })
			.andWhere('user.isActivated = :isActivated', { isActivated: true })
			.orderBy('user.nickname')
			.skip(skip)
			.take(take)
			.getMany();

		this._logger.successfulDBQuery({
			method: this.getPublicUsers.name,
			repository: 'UsersRepository',
			data: users,
		});

		return users;
	}

	public async getByField(fieldName: TUserGetFields, fieldValue: string): Promise<User | null> {
		const user: User | null = await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.leftJoinAndSelect('user.accountSettings', 'accountSettings')
			.leftJoinAndSelect('user.OTPCode', 'OTPCode')
			.leftJoinAndSelect('user.JWTToken', 'JWTToken')
			.leftJoinAndSelect('user.passwordResetToken', 'passwordResetToken')
			.where(`user.${fieldName} = :fieldValue`, { fieldValue })
			.getOne();

		this._logger.successfulDBQuery({
			method: this.getByField.name,
			repository: 'UsersRepository',
			data: user,
		});

		return user;
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
