import { IsDateString, IsString } from 'class-validator';

/**
 * DTO class representing user data for creating new user
 */
export class CreateStatusDto {
	@IsDateString({}, { message: '$property must be a valid dateTime' })
	dateTime: string;

	@IsString()
	statusText: string;
}
