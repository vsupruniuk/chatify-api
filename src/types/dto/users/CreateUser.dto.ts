import { SignupRequestDto } from '@dtos/auth/SignupRequest.dto';
import { AccountSettingsFullDto } from '../accountSettings/accountSettingsFull.dto';
import { OTPCodeResponseDto } from '../OTPCodes/OTPCodeResponse.dto';

/**
 * DTO class representing user data for creating new user
 */
export class CreateUserDto extends (SignupRequestDto as new () => Omit<
	SignupRequestDto,
	'passwordConfirmation'
>) {
	public accountSettings: AccountSettingsFullDto;

	public OTPCode: OTPCodeResponseDto;
}
