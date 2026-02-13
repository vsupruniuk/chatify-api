import { Injectable } from '@nestjs/common';

import * as crypto from 'node:crypto';
import { promisify } from 'node:util';

import { ICryptoService } from '@services';

import { cryptoConfig } from '@configs';

@Injectable()
export class CryptoService implements ICryptoService {
	public async encryptText(text: string): Promise<string> {
		const iv: Buffer = crypto.randomBytes(cryptoConfig.ivLength);
		const salt: Buffer = crypto.randomBytes(cryptoConfig.saltLength);
		const key = (await promisify(crypto.scrypt)(
			cryptoConfig.password,
			salt,
			cryptoConfig.keyLength,
		)) as Buffer;

		const cipher: crypto.Decipheriv = crypto.createCipheriv(cryptoConfig.algorithm, key, iv);
		const encryptedText: Buffer = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

		return Buffer.concat([salt, iv, encryptedText]).toString(
			cryptoConfig.encryptionEncoding as BufferEncoding,
		);
	}

	public async decryptText(encryptedText: string): Promise<string> {
		const encryptedBuffer: Buffer = Buffer.from(
			encryptedText,
			cryptoConfig.encryptionEncoding as BufferEncoding,
		);

		const salt: Buffer = encryptedBuffer.subarray(0, cryptoConfig.saltLength);
		const iv: Buffer = encryptedBuffer.subarray(
			cryptoConfig.saltLength,
			cryptoConfig.saltLength + cryptoConfig.ivLength,
		);

		const encryptedTextContent: Buffer = encryptedBuffer.subarray(
			cryptoConfig.saltLength + cryptoConfig.ivLength,
		);

		const key = (await promisify(crypto.scrypt)(
			cryptoConfig.password,
			salt,
			cryptoConfig.keyLength,
		)) as Buffer;

		const decipher: crypto.Decipheriv = crypto.createDecipheriv(cryptoConfig.algorithm, key, iv);

		const decryptedText: Buffer = Buffer.concat([
			decipher.update(encryptedTextContent),
			decipher.final(),
		]);

		return decryptedText.toString('utf8');
	}
}
