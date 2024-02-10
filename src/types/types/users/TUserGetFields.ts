import { UserFullDto } from '@DTO/users/UserFull.dto';

export type TUserGetFields = keyof Pick<UserFullDto, 'id' | 'email' | 'nickname'>;
