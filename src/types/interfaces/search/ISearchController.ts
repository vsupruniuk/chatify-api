/**
 * Interface representing public methods of search controller
 */
export interface ISearchController {
	// /**
	//  * Method for searching activated users by nickname
	//  * @param appUserPayload - user data from access token
	//  * @param nickname - nickname for searching
	//  * @param page - page of founded results. (One page - N take). If not provided 1 will be used by default
	//  * @param take - number of records per 1 page. If not provided 10 will be used by default
	//  * @returns UserPublicDto - founded users
	//  */
	// findUsers(
	// 	appUserPayload: JWTPayloadDto,
	// 	nickname: string,
	// 	page?: number,
	// 	take?: number,
	// ): Promise<UserPublicDto[]>;
}
