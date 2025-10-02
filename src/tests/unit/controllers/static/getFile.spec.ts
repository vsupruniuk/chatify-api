import { NotFoundException, StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { Readable } from 'stream';
import { ReadStream } from 'fs';

import { StaticController } from '@controllers';

import { providers } from '@modules/providers';

describe('Static controller', (): void => {
	const publicFolderPathMock: string = '/tmp/public';

	let staticController: StaticController;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [StaticController],
			providers: [
				JwtService,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		staticController = moduleFixture.get(StaticController);

		(staticController as unknown as { _publicFolderPath: string })._publicFolderPath =
			publicFolderPathMock;
	});

	describe('Get file', (): void => {
		const fileName: string = 'user.png';

		const streamMock = new Readable();

		beforeEach((): void => {
			jest.spyOn(path, 'resolve').mockImplementation((...parts: string[]) => parts.join('/'));
			jest.spyOn(fs, 'existsSync').mockReturnValue(true);
			jest.spyOn(fs, 'createReadStream').mockReturnValue(streamMock as ReadStream);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should return streamable file if file is exist', (): void => {
			const result: StreamableFile = staticController.getFile(fileName);

			expect(result.getStream()).toBe(streamMock);
			expect(result.options).toEqual({ type: 'image/jpeg' });
		});

		it('should return response as instance of StreamableFile', (): void => {
			const result: StreamableFile = staticController.getFile(fileName);

			expect(result).toBeInstanceOf(StreamableFile);
		});

		it('should throw not found exception if file does not exist', (): void => {
			jest.spyOn(fs, 'existsSync').mockReturnValue(false);

			expect(() => staticController.getFile(fileName)).toThrow(NotFoundException);
		});

		it('should throw not found exception on path traversal attempt', (): void => {
			jest
				.spyOn(path, 'resolve')
				.mockImplementation((...parts: string[]) =>
					parts.join('/').replace('/tmp/public/../', '/tmp/'),
				);

			expect(() => staticController.getFile(`../${fileName}`)).toThrow(NotFoundException);
		});
	});
});
