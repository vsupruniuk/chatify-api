import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';

import { AppModule } from '@modules';

import { GlobalExceptionFilter } from '@filters';

import { corsConfig, helmetConfig, validationPipeConfig } from '@configs';

async function bootstrap(): Promise<void> {
	const port: number = Number(process.env.PORT);

	const app: INestApplication = await NestFactory.create(AppModule);

	app.enableCors(corsConfig);
	app.use(helmet(helmetConfig));
	app.use(cookieParser(process.env.COOKIE_SECRET));
	app.use(compression());

	app.useGlobalFilters(new GlobalExceptionFilter());
	app.useGlobalPipes(new ValidationPipe(validationPipeConfig));

	await app.listen(port, () => {
		console.log(`Server started on port ${port}`);
	});
}

bootstrap();
