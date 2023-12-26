export class UpdateUserDto {
	about: string | null;
	avatarUrl: string | null;
	email: string;
	firstName: string;
	isActivated: boolean;
	lastName: string | null;
	nickname: string;
}
