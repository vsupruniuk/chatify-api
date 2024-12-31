import {
	CallHandler,
	ExecutionContext,
	HttpStatus,
	INestApplication,
	StreamableFile,
	UnauthorizedException,
	ValidationPipe,
} from '@nestjs/common';
import { IStaticController } from '@Interfaces/static/IStaticController';
import { users } from '@TestMocks/User/users';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { plainToInstance } from 'class-transformer';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { TUserPayload } from '@Types/users/TUserPayload';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@Modules/app.module';
import { SearchModule } from '@Modules/search.module';
import { StaticController } from '@Controllers/static.controller';
import * as request from 'supertest';
import * as fs from 'node:fs';
import { Headers } from '@Enums/Headers.enum';
import * as path from 'path';
import { ReadStream } from 'fs';
import { Readable } from 'stream';
import { ContentTypes } from '@Enums/ContentTypes.enum';

describe('StaticController', (): void => {
	let app: INestApplication;
	let staticController: IStaticController;

	let isAuthorized: boolean = false;

	const validToken: string = 'valid-token';
	const invalidToken: string = 'invalid-token';
	const existingFileName: string = 'sample.jpg';
	const nonExistingFileName: string = 'nonExisting-file.jpg';
	const staticFileFolder: string = 'public';
	const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, users[0], {
		excludeExtraneousValues: true,
	});

	const authInterceptorMock: Partial<AuthInterceptor> = {
		async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
			if (!isAuthorized) {
				throw new UnauthorizedException(['Please, login to perform this action']);
			}

			const request: Request & TUserPayload = context.switchToHttp().getRequest();

			request.user = appUserPayload;

			return next.handle();
		},
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, SearchModule],
		})
			.overrideInterceptor(AuthInterceptor)
			.useValue(authInterceptorMock)
			.compile();

		app = moduleFixture.createNestApplication();
		staticController = moduleFixture.get<IStaticController>(StaticController);

		app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: false }));

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('GET /static/:fileName', (): void => {
		beforeEach((): void => {
			jest.spyOn(path, 'join').mockImplementation((...paths) => paths.join('/'));
			jest.spyOn(fs, 'existsSync').mockReturnValue(true);
			jest.spyOn(fs, 'createReadStream').mockImplementation(() => {
				const stream = new Readable();
				stream._read = () => {
					stream.push(null);
				};
				return stream as ReadStream;
			});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(staticController.getFile).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(staticController.getFile).toBeInstanceOf(Function);
		});

		it('should return 401 status if authorization header is not passed', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get(`/static/${existingFileName}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token not passed to authorization header', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get(`/static/${existingFileName}`)
				.set(Headers.AUTHORIZATION, 'Bearer')
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if access token invalid', async (): Promise<void> => {
			await request(app.getHttpServer())
				.get(`/static/${existingFileName}`)
				.set(Headers.AUTHORIZATION, `Bearer ${invalidToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 404 if the file is not found', async (): Promise<void> => {
			jest.spyOn(fs, 'existsSync').mockReturnValue(false);

			isAuthorized = true;

			await request(app.getHttpServer())
				.get(`/static/${nonExistingFileName}`)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.NOT_FOUND);
		});

		it('should return 200 and the file if it exists', async (): Promise<void> => {
			isAuthorized = true;

			await request(app.getHttpServer())
				.get(`/static/${existingFileName}`)
				.set(Headers.AUTHORIZATION, `Bearer ${validToken}`)
				.expect(HttpStatus.OK)
				.expect('Content-Type', ContentTypes.IMAGE_JPEG);
		});

		it('should return response as a StreamableFile', (): void => {
			const streamableFile: StreamableFile = staticController.getFile(existingFileName);

			expect(streamableFile).toBeInstanceOf(StreamableFile);
		});

		it('should use join method from path module to create correct path to file', (): void => {
			staticController.getFile(existingFileName);

			expect(path.join).toHaveBeenCalledTimes(1);
			expect(path.join).toHaveBeenNthCalledWith(1, staticFileFolder, existingFileName);
		});

		it('should use createReadStream method from fs module to create stream from the file', (): void => {
			staticController.getFile(existingFileName);

			expect(fs.createReadStream).toHaveBeenCalledTimes(1);
			expect(fs.createReadStream).toHaveBeenNthCalledWith(
				1,
				`${staticFileFolder}/${existingFileName}`,
			);
		});

		it('should use existsSync method from fs module to check if file exist', (): void => {
			staticController.getFile(existingFileName);

			expect(fs.existsSync).toHaveBeenCalledTimes(1);
			expect(fs.existsSync).toHaveBeenNthCalledWith(1, `${staticFileFolder}/${existingFileName}`);
		});
	});
});
