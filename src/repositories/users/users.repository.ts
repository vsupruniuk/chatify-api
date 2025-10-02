import { Injectable } from '@nestjs/common';

import * as dayjs from 'dayjs';
import { Brackets, DataSource, EntityManager, InsertResult, WhereExpressionBuilder } from 'typeorm';

import { IUsersRepository } from '@repositories';

import { User, AccountSettings, JWTToken, PasswordResetToken, OTPCode } from '@entities';

import { SignupRequestDto } from '@dtos/auth/signup';
import { UpdateAppUserRequestDto } from '@dtos/appUser';

@Injectable()
export class UsersRepository implements IUsersRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async findByEmailOrNickname(email: string, nickname: string): Promise<User | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.where('user.email = :email', { email })
			.orWhere('user.nickname = :nickname', { nickname })
			.getOne();
	}

	public async findById(id: string): Promise<User | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.where('user.id = :id', { id })
			.getOne();
	}

	public async findAllByIds(ids: string[]): Promise<User[]> {
		return await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.where('user.id IN (:...ids)', { ids })
			.getMany();
	}

	public async findByNickname(nickname: string): Promise<User | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.where('user.nickname = :nickname', { nickname })
			.getOne();
	}

	public async findByNotExpiredPasswordResetToken(token: string): Promise<User | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.innerJoinAndSelect('user.passwordResetToken', 'passwordResetToken')
			.where('passwordResetToken.token = :token', { token })
			.andWhere(
				new Brackets((qb: WhereExpressionBuilder) => {
					qb.where('passwordResetToken.expiresAt IS NULL').orWhere(
						'passwordResetToken.expiresAt > :now',
						{ now: dayjs().toDate() },
					);
				}),
			)
			.getOne();
	}

	public async findByEmailAndNotActiveWithOtpCode(email: string): Promise<User | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.leftJoinAndSelect('user.otpCode', 'otpCode')
			.where('user.email = :email', { email })
			.andWhere('user.isActivated = :isActivated', { isActivated: false })
			.getOne();
	}

	public async findByEmailWithPasswordResetToken(email: string): Promise<User | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.leftJoinAndSelect('user.passwordResetToken', 'passwordResetToken')
			.where('user.email = :email', { email })
			.getOne();
	}

	public async findFullUserWithJwtTokenByEmail(email: string): Promise<User | null> {
		return this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.leftJoinAndSelect('user.jwtToken', 'jwtToken')
			.where('user.email = :email', { email })
			.getOne();
	}

	public async findByIdWithAccountSettings(id: string): Promise<User | null> {
		return this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.leftJoinAndSelect('user.accountSettings', 'accountSettings')
			.where('user.id = :id', { id })
			.getOne();
	}

	public async findActivatedUsersByNickname(
		nickname: string,
		skip: number,
		take: number,
	): Promise<User[]> {
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

	public async createUser(
		otpCode: number,
		otpCodeExpiresAt: string,
		signupRequestDto: SignupRequestDto,
	): Promise<User> {
		return await this._dataSource.transaction(
			async (transactionalEntityManager: EntityManager): Promise<User> => {
				const accountSettingInsertResult: InsertResult = await transactionalEntityManager
					.createQueryBuilder()
					.insert()
					.into(AccountSettings)
					.values({})
					.returning('*')
					.execute();

				const jwtTokenInsertResult: InsertResult = await transactionalEntityManager
					.createQueryBuilder()
					.insert()
					.into(JWTToken)
					.values({})
					.returning('*')
					.execute();

				const passwordResetTokenInsertResult: InsertResult = await transactionalEntityManager
					.createQueryBuilder()
					.insert()
					.into(PasswordResetToken)
					.values({})
					.returning('*')
					.execute();

				const otpCodeInsertResult: InsertResult = await transactionalEntityManager
					.createQueryBuilder()
					.insert()
					.into(OTPCode)
					.values({ code: otpCode, expiresAt: otpCodeExpiresAt })
					.returning('*')
					.execute();

				const userInsertResult: InsertResult = await transactionalEntityManager
					.createQueryBuilder()
					.insert()
					.into(User)
					.values({
						...signupRequestDto,
						accountSettings: accountSettingInsertResult.generatedMaps[0],
						jwtToken: jwtTokenInsertResult.generatedMaps[0],
						passwordResetToken: passwordResetTokenInsertResult.generatedMaps[0],
						otpCode: otpCodeInsertResult.generatedMaps[0],
					})
					.returning('*')
					.execute();

				return userInsertResult.generatedMaps[0] as User;
			},
		);
	}

	public async activateUser(userId: string, otpCodeId: string): Promise<User | null> {
		return await this._dataSource.transaction(
			async (transactionalEntityManager: EntityManager): Promise<User | null> => {
				await transactionalEntityManager
					.createQueryBuilder()
					.update(User)
					.set(<User>{ isActivated: true })
					.where('id = :userId', { userId })
					.execute();

				await transactionalEntityManager
					.createQueryBuilder()
					.update(OTPCode)
					.set(<OTPCode>{ code: null, expiresAt: null })
					.where('id = :otpCodeId', { otpCodeId })
					.execute();

				return await transactionalEntityManager
					.createQueryBuilder()
					.select('user')
					.from(User, 'user')
					.where('user.id = :userId', { userId })
					.leftJoinAndSelect('user.jwtToken', 'jwtToken')
					.getOne();
			},
		);
	}

	public async updatePassword(
		userId: string,
		tokenId: string,
		password: string,
	): Promise<User | null> {
		return await this._dataSource.transaction(
			async (transactionalEntityManager: EntityManager): Promise<User | null> => {
				await transactionalEntityManager
					.createQueryBuilder()
					.update(User)
					.set(<User>{ password })
					.where('id = :userId', { userId })
					.execute();

				await transactionalEntityManager
					.createQueryBuilder()
					.update(PasswordResetToken)
					.set(<PasswordResetToken>{ token: null, expiresAt: null })
					.where('id = :tokenId', { tokenId })
					.execute();

				return await transactionalEntityManager
					.createQueryBuilder()
					.select('user')
					.from(User, 'user')
					.where('user.id = :userId', { userId })
					.getOne();
			},
		);
	}

	public async updateAppUser(
		id: string,
		updateAppUserDto: UpdateAppUserRequestDto,
	): Promise<User | null> {
		return await this._dataSource.transaction(
			async (transactionalEntityManager: EntityManager): Promise<User | null> => {
				await transactionalEntityManager
					.createQueryBuilder()
					.update(User)
					.set(updateAppUserDto)
					.where('id = :id', { id })
					.execute();

				return await transactionalEntityManager
					.createQueryBuilder()
					.select('user')
					.from(User, 'user')
					.leftJoinAndSelect('user.accountSettings', 'accountSettings')
					.where('user.id = :id', { id })
					.getOne();
			},
		);
	}

	public async updateUserAvatarUrl(userId: string, avatarUrl: string | null): Promise<void> {
		await this._dataSource
			.createQueryBuilder()
			.update(User)
			.set(<User>{ avatarUrl })
			.where('id = :userId', { userId })
			.execute();
	}
}
