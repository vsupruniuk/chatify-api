import { SearchController } from '@Controllers/searchController';
import {
	accountSettingsRepositoryProvider,
	jwtTokensRepositoryProvider,
	jwtTokensServiceProvider,
	otpCodesRepositoryProvider,
	passwordResetTokensRepositoryProvider,
	usersRepositoryProvider,
	usersServiceProvider,
} from '@Modules/providers/index';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Module({
	imports: [],
	controllers: [SearchController],
	providers: [
		JwtService,
		jwtTokensServiceProvider,
		jwtTokensRepositoryProvider,
		usersServiceProvider,
		usersRepositoryProvider,
		accountSettingsRepositoryProvider,
		otpCodesRepositoryProvider,
		passwordResetTokensRepositoryProvider,
	],
})
export class SearchModule {}
