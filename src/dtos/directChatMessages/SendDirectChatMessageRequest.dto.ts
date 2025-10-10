import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { Trim } from '@decorators/sanitizing';

export class SendDirectChatMessageRequestDto {
	@Trim()
	@IsUUID('4', { message: 'Wrong $property format. UUID is expected' })
	public directChatId: string;

	@Trim()
	@MaxLength(500, { message: '$property can be $constraint1 characters long maximum|$property' })
	@MinLength(1, {
		message: '$property must be at least $constraint1 characters long|$property',
	})
	@IsString({ message: '$property must be a string|$property' })
	public messageText: string;
}
