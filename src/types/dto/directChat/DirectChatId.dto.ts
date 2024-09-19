import { Expose } from 'class-transformer';

export class DirectChatIdDto {
	@Expose()
	id: string;
}
