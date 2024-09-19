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

	/**
	 * Retrieve chat messages
	 * @param appUserPayload - user data from access token
	 * @param chatId - chat id for retrieving messages
	 * @param page - page number of records
	 * @param take - number of record to retrieve
	 */
	getChatMessages(
		appUserPayload: JWTPayloadDto,
		chatId: string,
		page?: number,
		take?: number,
	): Promise<ResponseResult>;
}
