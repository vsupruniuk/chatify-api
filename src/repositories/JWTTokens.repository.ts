import { Injectable } from '@nestjs/common';
import { IJWTTokensRepository } from '@interfaces/jwt/IJWTTokensRepository';

@Injectable()
export class JWTTokensRepository implements IJWTTokensRepository {
	// constructor(private readonly _dataSource: DataSource) {}
	//
	// // TODO check if needed
	// public async getById(id: string): Promise<JWTToken | null> {
	// 	return await this._dataSource
	// 		.createQueryBuilder()
	// 		.select('jwtToken')
	// 		.from(JWTToken, 'jwtToken')
	// 		.where('jwtToken.id = :id', { id })
	// 		.getOne();
	// }
	//
	// // TODO check if needed
	// public async createToken(token: string): Promise<string> {
	// 	const result: InsertResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.insert()
	// 		.into(JWTToken)
	// 		.values({ token })
	// 		.execute();
	//
	// 	return result.identifiers[0].id;
	// }
	//
	// // TODO check if needed
	// public async updateToken(id: string, token: string): Promise<boolean> {
	// 	const updateResult: UpdateResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.update(JWTToken)
	// 		.set({ token })
	// 		.where('id = :id', { id })
	// 		.execute();
	//
	// 	return updateResult.affected ? updateResult.affected > 0 : false;
	// }
	//
	// // TODO check if needed
	// public async deleteToken(id: string): Promise<boolean> {
	// 	const result: DeleteResult = await this._dataSource
	// 		.createQueryBuilder()
	// 		.delete()
	// 		.from(JWTToken)
	// 		.where('id = :id', { id })
	// 		.execute();
	//
	// 	return result.affected ? result.affected > 0 : false;
	// }
}
