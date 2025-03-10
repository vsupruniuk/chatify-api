import { Expose } from 'class-transformer';

export class UploadAvatarResponseDto {
	@Expose()
	avatarUrl: string | null;
}
