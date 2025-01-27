import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { Injectable } from '@nestjs/common';
import { TUserGetFields } from '@Types/users/TUserGetFields';
import { DataSource, InsertResult, UpdateResult } from 'typeorm';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { User } from '@Entities/User.entity';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';

@Injectable()
export class UsersRepository implements IUsersRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async getPublicUsers(nickname: string, skip: number, take: number): Promise<User[]> {
		return await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.where('user.nickname LIKE :nickname', { nickname: `%${nickname}%` })
			.andWhere('user.isActivated = :isActivated', { isActivated: true })
			.orderBy('user.nickname')
			.skip(skip)
			.take(take)
			.getMany();
	}

	public async getByField(fieldName: TUserGetFields, fieldValue: string): Promise<User | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.leftJoinAndSelect('user.accountSettings', 'accountSettings')
			.leftJoinAndSelect('user.OTPCode', 'OTPCode')
			.leftJoinAndSelect('user.JWTToken', 'JWTToken')
			.leftJoinAndSelect('user.passwordResetToken', 'passwordResetToken')
			.where(`user.${fieldName} = :fieldValue`, { fieldValue })
			.getOne();
	}

	public async getByEmailOrNickname(email: string, nickname: string): Promise<User | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.leftJoinAndSelect('user.accountSettings', 'accountSettings')
			.leftJoinAndSelect('user.OTPCode', 'OTPCode')
			.leftJoinAndSelect('user.JWTToken', 'JWTToken')
			.leftJoinAndSelect('user.passwordResetToken', 'passwordResetToken')
			.where('user.email = :email', { email })
			.orWhere('user.nickname = :nickname', { nickname })
			.getOne();
	}

	public async createUser(user: CreateUserDto): Promise<string> {
		const result: InsertResult = await this._dataSource
			.createQueryBuilder()
			.insert()
			.into(User)
			.values(user)
			.execute();

		return result.identifiers[0].id;
	}

	public async updateUser(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<boolean> {
		const updateResult: UpdateResult = await this._dataSource
			.createQueryBuilder()
			.update(User)
			.set(updateUserDto)
			.where('id = :userId', { userId })
			.execute();

		return updateResult.affected ? updateResult.affected > 0 : false;
	}
}
