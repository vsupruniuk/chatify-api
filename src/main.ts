import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './exceptionFilters/globalException.filter';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
	const port: number = Number(process.env.PORT) || 3000;

	const app: INestApplication = await NestFactory.create(AppModule);

	app.enableCors({ origin: '*', credentials: true });
	app.use(helmet());
	app.use(cookieParser());
	app.use(compression());

	app.useGlobalFilters(new GlobalExceptionFilter());
	app.useGlobalPipes(new ValidationPipe());

	await app.listen(port, () => {
		console.log(`Server started on port ${port}`);
	});
}

bootstrap();
