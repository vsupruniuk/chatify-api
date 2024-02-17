import { UserFullDto } from '@DTO/users/UserFull.dto';
import { TUserGetFields } from '@Types/users/TUserGetFields';

export type TUserFullGetFields = TUserGetFields | keyof Pick<UserFullDto, 'passwordResetTokenId'>;
