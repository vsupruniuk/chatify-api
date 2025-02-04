import { ICryptoService } from '@Interfaces/crypto/ICryptoService';
import { CryptoService } from '@Services/crypto.service';
import * as crypto from 'crypto';
import { promisify } from 'util';

describe('Crypto service', (): void => {
	let cryptoService: ICryptoService;

	beforeAll((): void => {
		cryptoService = new CryptoService();
	});

	describe('encryptText', (): void => {
		const ivLength: number = Number(process.env.CRYPTO_IV_LENGTH);
		const saltLength: number = Number(process.env.CRYPTO_SALT_LENGTH);
		const keyLength: number = Number(process.env.CRYPTO_KEY_LENGTH);
		const password: string = String(process.env.CRYPTO_PASSWORD);
		const algorithm: string = String(process.env.CRYPTO_CIPHER_ALGORITHM);
		const encryptionEncoding: string = String(process.env.CRYPTO_ENCRYPTION_ENCODING);

		it('should be defined', async (): Promise<void> => {
			expect(cryptoService.encryptText).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(cryptoService.decryptText).toBeInstanceOf(Function);
		});

		it('should properly encrypt text', async (): Promise<void> => {
			const initialText: string = 'Hello, world!';

			const encryptedText: string = await cryptoService.encryptText(initialText);

			const encryptedBuffer: Buffer = Buffer.from(
				encryptedText,
				encryptionEncoding as BufferEncoding,
			);

			const salt: Buffer = encryptedBuffer.subarray(0, saltLength);
			const iv: Buffer = encryptedBuffer.subarray(saltLength, saltLength + ivLength);

			const encryptedTextContent: Buffer = encryptedBuffer.subarray(saltLength + ivLength);

			const key = (await promisify(crypto.scrypt)(password, salt, keyLength)) as Buffer;

			const decipher: crypto.Decipher = crypto.createDecipheriv(algorithm, key, iv);
			const decryptedText: Buffer = Buffer.concat([
				decipher.update(encryptedTextContent),
				decipher.final(),
			]);

			const decryptedResult: string = decryptedText.toString('utf-8');

			expect(decryptedResult).toBe(initialText);
		});
	});
});
