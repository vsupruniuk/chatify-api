import { Expose, Type } from 'class-transformer';
import { PasswordResetTokenDto } from '@dtos/passwordResetToken/PasswordResetToken.dto';
import { UserShortDto } from './UserShort.dto';
import { JWTTokenFullDto } from '../JWTTokens/JWTTokenFull.dto';

export class UserFullDto extends UserShortDto {
	@Expose()
	public isActivated: boolean;

	@Expose()
	public password: string;

	@Expose()
	@Type(() => PasswordResetTokenDto)
	public passwordResetToken?: PasswordResetTokenDto;

	@Expose()
	@Type(() => JWTTokenFullDto)
	public JWTToken?: JWTTokenFullDto;
}
