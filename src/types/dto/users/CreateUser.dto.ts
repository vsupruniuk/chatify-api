import { SignupUserDto } from '@DTO/users/SignupUser.dto';

export class CreateUserDto extends (SignupUserDto as new () => Omit<
	SignupUserDto,
	'passwordConfirmation'
>) {
	accountSettingsId: string;
	statusId: string;
}
