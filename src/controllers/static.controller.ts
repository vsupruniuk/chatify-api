import { IStaticController } from '@Interfaces/static/IStaticController';
import {
	Controller,
	Get,
	NotFoundException,
	Param,
	StreamableFile,
	UseInterceptors,
} from '@nestjs/common';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { resolve } from 'path';
import { createReadStream, existsSync, ReadStream } from 'fs';

@Controller('static')
@UseInterceptors(AuthInterceptor)
export class StaticController implements IStaticController {
	private readonly _publicFolderPath: string = resolve(
		'.',
		String(process.env.PUBLIC_FILES_FOLDER),
	);

	@Get(':fileName')
	public getFile(@Param('fileName') fileName: string): StreamableFile {
		const filePath: string = resolve(this._publicFolderPath, fileName);

		if (!filePath.startsWith(this._publicFolderPath) || !existsSync(filePath)) {
			throw new NotFoundException();
		}

		const fileStream: ReadStream = createReadStream(filePath);

		return new StreamableFile(fileStream, { type: 'image/jpeg' });
	}
}
