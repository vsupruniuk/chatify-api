import { Expose } from 'class-transformer';

export class OTPCodeIdDto {
	@Expose()
	public id: string;
}
