import { ResponseResult } from '@Responses/ResponseResult';

export interface IAppUserController {
	/**
	 * Returns information about current logged-in user
	 * @param accessToken - user access token from authorization header
	 * @returns ResponseResult - current user information
	 */
	getUser(accessToken: string): Promise<ResponseResult>;
}
