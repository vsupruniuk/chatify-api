import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/**
 * DTO class representing data that need to create direct chat
 */
export class CreateDirectChatDto {
	@IsUUID('4', { message: 'Wrong $property format. UUID is expected' })
	public receiverId: string;

	@IsString({ message: '$property must be a string|$property' })
	@MinLength(1, {
		message: '$property must be at least $constraint1 characters long|$property',
	})
	@MaxLength(500, { message: '$property can be $constraint1 characters long maximum|$property' })
	public messageText: string;
}
