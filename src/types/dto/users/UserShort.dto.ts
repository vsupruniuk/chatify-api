import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO class representing response with user data
 */
export class UserShortDto {
	@ApiProperty({
		type: String,
		description: 'Generated user id in uuid format',
		required: true,
		maxLength: 36,
		example: '9d9b7a25-275c-4722-aedd-2e9fa922f142',
	})
	@Expose()
	id: string;

	@ApiProperty({
		type: String,
		nullable: true,
		description: 'Information about user, provided by this user',
		required: true,
		maxLength: 255,
		example:
			'Big man in his suit of armour. Take that off, and what are you? Genius, billionaire, playboy, philanthropist.',
	})
	@Expose()
	about: string | null;

	@ApiProperty({
		type: String,
		nullable: true,
		description: 'Path to user avatar image',
		required: true,
		maxLength: 255,
		example: 'images/t.stark.png',
	})
	@Expose()
	avatarUrl: string | null;

	@ApiProperty({
		type: String,
		required: true,
		description: 'User email',
		uniqueItems: true,
		maxLength: 255,
		example: 't.stark@mail.com',
	})
	@Expose()
	email: string;

	@ApiProperty({
		type: String,
		required: true,
		description: 'User first name',
		minLength: 3,
		maxLength: 255,
		example: 'Tony',
	})
	@Expose()
	firstName: string;

	@ApiProperty({
		type: String,
		required: true,
		nullable: true,
		description: 'User last name',
		minLength: 3,
		maxLength: 255,
		example: 'Stark',
	})
	@Expose()
	lastName: string | null;

	@ApiProperty({
		type: String,
		required: true,
		uniqueItems: true,
		description: 'User public nickname',
		minLength: 3,
		maxLength: 255,
		example: 't.stark',
	})
	@Expose()
	nickname: string;

	@ApiProperty({
		type: String,
		description: 'Generated user account settings id in uuid format',
		required: true,
		maxLength: 36,
		example: '9d9b7a25-275c-4722-aedd-2e9fa922f143',
	})
	@Expose()
	accountSettingsId: string;

	@ApiProperty({
		type: String,
		description: 'Generated user OTP code id in uuid format',
		required: true,
		nullable: true,
		maxLength: 36,
		example: '9d9b7a25-275c-4722-aedd-2e9fa922f144',
	})
	@Expose()
	OTPCodeId: string | null;
}
