import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class SendDirectMessageDto {
	@IsUUID('4', { message: 'Wrong $property format. UUID is expected' })
	public directChatId: string;

	@IsString({ message: '$property must be a string|$property' })
	@MinLength(1, {
		message: '$property must be at least $constraint1 characters long|$property',
	})
	@MaxLength(500, { message: '$property can be $constraint1 characters long maximum|$property' })
	public messageText: string;
}
