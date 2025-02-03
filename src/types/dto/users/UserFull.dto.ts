import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { Expose, Type } from 'class-transformer';

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
