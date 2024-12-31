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
import { join } from 'path';
import { createReadStream, existsSync, ReadStream } from 'fs';

@Controller('static')
@UseInterceptors(AuthInterceptor)
export class StaticController implements IStaticController {
	private readonly _publicFolderPath: string = join('.', 'public');

	@Get(':fileName')
	public getFile(@Param('fileName') fileName: string): StreamableFile {
		const filePath: string = join(this._publicFolderPath, fileName);

		if (!existsSync(filePath)) {
			throw new NotFoundException();
		}

		const fileStream: ReadStream = createReadStream(filePath);

		return new StreamableFile(fileStream, { type: 'image/jpeg' });
	}
}
