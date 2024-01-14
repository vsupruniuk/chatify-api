import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';

import { AppModule } from '@Modules/app.module';
import { GlobalExceptionFilter } from '@Filters/globalException.filter';

async function bootstrap(): Promise<void> {
	const port: number = Number(process.env.PORT) || 3000;

	const app: INestApplication = await NestFactory.create(AppModule, {
		logger: ['log', 'fatal', 'error', 'warn', 'debug'],
	});

	app.enableCors({ origin: process.env.CLIENT_URL || '', credentials: true });
	app.use(helmet());
	app.use(cookieParser());
	app.use(compression());

	app.useGlobalFilters(new GlobalExceptionFilter());
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			stopAtFirstError: false,
		}),
	);

	await app.listen(port, () => {
		console.log(`Server started on port ${port}`);
	});
}

bootstrap();
