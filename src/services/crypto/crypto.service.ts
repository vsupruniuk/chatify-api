import { ICryptoService } from '@services/crypto/ICryptoService';
import * as crypto from 'crypto';
import { promisify } from 'util';

export class CryptoService implements ICryptoService {
	private readonly _ivLength: number = Number(process.env.CRYPTO_IV_LENGTH);
	private readonly _saltLength: number = Number(process.env.CRYPTO_SALT_LENGTH);
	private readonly _keyLength: number = Number(process.env.CRYPTO_KEY_LENGTH);
	private readonly _password: string = String(process.env.CRYPTO_PASSWORD);
	private readonly _algorithm: string = String(process.env.CRYPTO_CIPHER_ALGORITHM);
	private readonly _encryptionEncoding: string = String(process.env.CRYPTO_ENCRYPTION_ENCODING);

	public async encryptText(text: string): Promise<string> {
		const iv: Buffer = crypto.randomBytes(this._ivLength);
		const salt: Buffer = crypto.randomBytes(this._saltLength);
		const key = (await promisify(crypto.scrypt)(this._password, salt, this._keyLength)) as Buffer;

		const cipher: crypto.Cipher = crypto.createCipheriv(this._algorithm, key, iv);
		const encryptedText: Buffer = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

		return Buffer.concat([salt, iv, encryptedText]).toString(
			this._encryptionEncoding as BufferEncoding,
		);
	}

	public async decryptText(encryptedText: string): Promise<string> {
		const encryptedBuffer: Buffer = Buffer.from(
			encryptedText,
			this._encryptionEncoding as BufferEncoding,
		);

		const salt: Buffer = encryptedBuffer.subarray(0, this._saltLength);
		const iv: Buffer = encryptedBuffer.subarray(
			this._saltLength,
			this._saltLength + this._ivLength,
		);

		const encryptedTextContent: Buffer = encryptedBuffer.subarray(
			this._saltLength + this._ivLength,
		);

		const key = (await promisify(crypto.scrypt)(this._password, salt, this._keyLength)) as Buffer;

		const decipher: crypto.Decipher = crypto.createDecipheriv(this._algorithm, key, iv);
		const decryptedText: Buffer = Buffer.concat([
			decipher.update(encryptedTextContent),
			decipher.final(),
		]);

		return decryptedText.toString('utf-8');
	}
}
