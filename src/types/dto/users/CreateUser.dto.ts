import { AccountSettingsFullDto } from '@DTO/accountSettings/accountSettingsFull.dto';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';

/**
 * DTO class representing user data for creating new user
 */
export class CreateUserDto extends (SignupUserDto as new () => Omit<
	SignupUserDto,
	'passwordConfirmation'
>) {
	accountSettings: AccountSettingsFullDto;
	OTPCode: OTPCodeResponseDto;
}
