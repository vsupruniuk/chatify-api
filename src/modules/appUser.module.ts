import { AppUserController } from '@Controllers/appUser.controller';
import {
	accountSettingsRepositoryProvider,
	accountSettingsServiceProvider,
	jwtTokensRepositoryProvider,
	jwtTokensServiceProvider,
	otpCodesRepositoryProvider,
	passwordResetTokensRepositoryProvider,
	usersRepositoryProvider,
	usersServiceProvider,
} from '@Modules/providers/index';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';

@Module({
	imports: [
		CacheModule.register(),
		MulterModule.register({
			storage: diskStorage({
				destination: './public',
				filename(
					req: Request,
					file: Express.Multer.File,
					callback: (error: Error | null, filename: string) => void,
				) {
					callback(null, 'image.png');
				},
			}),
		}),
	],
	controllers: [AppUserController],
	providers: [
		JwtService,
		jwtTokensServiceProvider,
		jwtTokensRepositoryProvider,
		usersServiceProvider,
		usersRepositoryProvider,
		accountSettingsServiceProvider,
		accountSettingsRepositoryProvider,
		otpCodesRepositoryProvider,
		passwordResetTokensRepositoryProvider,
	],
})
export class AppUserModule {}
