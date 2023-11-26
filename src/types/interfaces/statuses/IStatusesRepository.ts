import { CreateStatusDto } from '@DTO/statuses/CreateStatus.dto';

/**
 * Interface representing public methods of statuses repository
 */
export interface IStatusesRepository {
	/**
	 * Method for creating status
	 * @param createStatusDto - status data for creating
	 * @returns id - of created status
	 */
	createStatus(createStatusDto: CreateStatusDto): Promise<string>;
}
