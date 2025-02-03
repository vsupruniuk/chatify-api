import { Expose } from 'class-transformer';

export class PasswordResetTokenIdDto {
	@Expose()
	public id: string;
}
