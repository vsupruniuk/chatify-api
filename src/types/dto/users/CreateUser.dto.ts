import { SignupUserDto } from '@DTO/users/SignupUser.dto';

/**
 * DTO class representing user data for creating new user
 */
export class CreateUserDto extends (SignupUserDto as new () => Omit<
	SignupUserDto,
	'passwordConfirmation'
>) {
	accountSettingsId: string;
	statusId: string;
}
