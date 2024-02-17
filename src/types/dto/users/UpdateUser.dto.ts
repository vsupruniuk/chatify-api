export class UpdateUserDto {
	about: string | null;
	avatarUrl: string | null;
	email: string;
	firstName: string;
	JWTTokenId: string | null;
	isActivated: boolean;
	lastName: string | null;
	nickname: string;
	password: string;
	passwordResetTokenId: string | null;
}
