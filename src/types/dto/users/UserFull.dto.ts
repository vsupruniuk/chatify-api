import { UserShortDto } from '@DTO/users/UserShort.dto';
import { Expose } from 'class-transformer';

export class UserFullDto extends UserShortDto {
	@Expose()
	isActivated: boolean;

	@Expose()
	nickname: string;

	@Expose()
	password: string;

	@Expose()
	passwordResetTokenId: string | null;

	@Expose()
	JWTTokenId: string | null;
}
