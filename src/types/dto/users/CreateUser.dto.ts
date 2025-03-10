import { SignupRequestDto } from '@dtos/auth/signup/SignupRequest.dto';
import { AccountSettingsDto } from '@dtos/accountSettings/accountSettings/AccountSettings.dto';
import { OTPCodeResponseDto } from '../OTPCodes/OTPCodeResponse.dto';

/**
 * DTO class representing user data for creating new user
 */
export class CreateUserDto extends (SignupRequestDto as new () => Omit<
	SignupRequestDto,
	'passwordConfirmation'
>) {
	public accountSettings: AccountSettingsDto;

	public OTPCode: OTPCodeResponseDto;
}
