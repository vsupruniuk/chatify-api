import { UserFullDto } from '../../dto/users/UserFull.dto';

export type TUserGetFields =
	| keyof Pick<UserFullDto, 'id' | 'email' | 'nickname'>
	| 'passwordResetTokenId';
