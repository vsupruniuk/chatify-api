import {
	Controller,
	Get,
	NotFoundException,
	Param,
	StreamableFile,
	UseInterceptors,
} from '@nestjs/common';

import { createReadStream, existsSync, ReadStream } from 'node:fs';
import { resolve } from 'node:path';

import { AuthInterceptor } from '@interceptors';

import { IStaticController } from '@controllers';

import { ContentType, PathParam, Route } from '@enums';

@Controller(Route.STATIC)
@UseInterceptors(AuthInterceptor)
export class StaticController implements IStaticController {
	private readonly _publicFolderPath: string = resolve(
		'.',
		String(process.env.PUBLIC_FILES_FOLDER),
	);

	@Get(`:${PathParam.FILE_NAME}`)
	public getFile(@Param(PathParam.FILE_NAME) fileName: string): StreamableFile {
		const filePath: string = resolve(this._publicFolderPath, fileName);

		if (!filePath.startsWith(this._publicFolderPath) || !existsSync(filePath)) {
			throw new NotFoundException('File not found');
		}

		const fileStream: ReadStream = createReadStream(filePath);

		return new StreamableFile(fileStream, { type: ContentType.IMAGE_JPEG });
	}
}
