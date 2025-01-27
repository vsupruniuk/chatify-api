import { EntityManager, InsertQueryBuilder, RelationQueryBuilder } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

export class QueryBuilderMock<T extends ObjectLiteral>
	implements
		Partial<EntityManager>,
		Partial<SelectQueryBuilder<T>>,
		Partial<RelationQueryBuilder<T>>,
		Partial<InsertQueryBuilder<T>>
{
	public createQueryBuilder: jest.Mock = jest.fn().mockReturnThis();
	public select: jest.Mock = jest.fn().mockReturnThis();
	public from: jest.Mock = jest.fn().mockReturnThis();
	public leftJoinAndSelect: jest.Mock = jest.fn().mockReturnThis();
	public leftJoinAndMapMany: jest.Mock = jest.fn().mockReturnThis();
	public where: jest.Mock = jest.fn().mockReturnThis();
	public orWhere: jest.Mock = jest.fn().mockReturnThis();
	public setParameter: jest.Mock = jest.fn().mockReturnThis();
	public orderBy: jest.Mock = jest.fn().mockReturnThis();
	public limit: jest.Mock = jest.fn().mockReturnThis();
	public getQuery: jest.Mock = jest.fn().mockReturnThis();
	public skip: jest.Mock = jest.fn().mockReturnThis();
	public take: jest.Mock = jest.fn().mockReturnThis();
	public getMany: jest.Mock = jest.fn().mockReturnThis();
	public getOne: jest.Mock = jest.fn().mockReturnThis();
	public insert: jest.Mock = jest.fn().mockReturnThis();
	public into: jest.Mock = jest.fn().mockReturnThis();
	public values: jest.Mock = jest.fn().mockReturnThis();
	public execute: jest.Mock = jest.fn().mockReturnThis();
	public relation: jest.Mock = jest.fn().mockReturnThis();
	public of: jest.Mock = jest.fn().mockReturnThis();
	public add: jest.Mock = jest.fn().mockReturnThis();
	public andWhere: jest.Mock = jest.fn().mockReturnThis();
	public whereExists: jest.Mock = jest.fn().mockReturnThis();
	public andWhereExists: jest.Mock = jest.fn().mockReturnThis();
}
