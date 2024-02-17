import { UserShortDto } from '@DTO/users/UserShort.dto';

export type TUserGetFields = keyof Pick<UserShortDto, 'id' | 'email' | 'nickname'>;
