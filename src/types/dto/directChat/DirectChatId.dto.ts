import { Expose } from 'class-transformer';

export class DirectChatIdDto {
	@Expose()
	public id: string;
}
