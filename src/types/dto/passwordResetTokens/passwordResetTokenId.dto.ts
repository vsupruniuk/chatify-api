import { Expose } from 'class-transformer';

export class PasswordResetTokenIdDto {
	@Expose()
	id: string;
}
