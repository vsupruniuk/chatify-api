import { ResponseResult } from '@Responses/ResponseResult';

export interface IDirectChatController {
	getLastChats(): Promise<ResponseResult>;
}
