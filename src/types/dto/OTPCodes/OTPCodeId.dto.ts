import { Expose } from 'class-transformer';

export class OTPCodeIdDto {
	@Expose()
	id: string;
}
