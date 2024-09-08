import { ResponseResult } from '@Responses/ResponseResult';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';

export interface IDirectChatsController {
	/**
	 * Retrieve user last direct chats
	 * @param appUserPayload - user data from access token
	 * @param page - page number of records
	 * @param take - number of records to retrieve
	 * @returns ResponseResult - successful response result
	 */
	getLastChats(
		appUserPayload: JWTPayloadDto,
		page?: number,
		take?: number,
	): Promise<ResponseResult>;

	getChatMessages(): Promise<ResponseResult>;
}
