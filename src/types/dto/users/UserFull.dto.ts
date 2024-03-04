import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { Expose, Type } from 'class-transformer';

export class UserFullDto extends UserShortDto {
	@Expose()
	isActivated: boolean;

	@Expose()
	nickname: string;

	@Expose()
	password: string;

	@Expose()
	@Type(() => PasswordResetTokenDto)
	passwordResetToken?: PasswordResetTokenDto;

	@Expose()
	@Type(() => JWTTokenFullDto)
	JWTToken?: JWTTokenFullDto;
}
