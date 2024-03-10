import { UpdateAppUserDto } from '@DTO/appUser/UpdateAppUser.dto';
import { ResponseResult } from '@Responses/ResponseResult';

export interface IAppUserController {
	/**
	 * Returns information about current logged-in user
	 * @param accessToken - user access token from authorization header
	 * @returns ResponseResult - current user information
	 */
	getUser(accessToken: string): Promise<ResponseResult>;

	/**
	 * Update user public information
	 * @param accessToken - user access token from authorization header
	 * @param updateAppUserDto - new information about user
	 * @returns ResponseResult - successful response result
	 */
	updateUser(accessToken: string, updateAppUserDto: UpdateAppUserDto): Promise<ResponseResult>;
}
