import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '@Modules/app.module';
import { GlobalExceptionFilter } from '@Filters/globalException.filter';

async function bootstrap(): Promise<void> {
	const port: number = Number(process.env.PORT) || 3000;

	const app: INestApplication = await NestFactory.create(AppModule, {
		logger: ['log', 'fatal', 'error', 'warn', 'debug'],
	});

	app.enableCors({ origin: '*', credentials: true });
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

	const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
		.setTitle('Chatify API documentation')
		.setDescription(
			'Chatify API documentation provide all necessary information about how to use API properly',
		)
		.setLicense('MIT', 'https://github.com/vsupruniuk/chatify-api/blob/master/LICENSE')
		.setVersion('0.1')
		.build();

	const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup('api-documentation', app, document);

	await app.listen(port, () => {
		console.log(`Server started on port ${port}`);
	});
}

bootstrap();
