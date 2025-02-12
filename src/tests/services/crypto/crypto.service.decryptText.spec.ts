import * as crypto from 'crypto';
import { promisify } from 'util';
import { ICryptoService } from '@interfaces/crypto/ICryptoService';
import { CryptoService } from '@services/crypto.service';

describe.skip('Crypto service', (): void => {
	let cryptoService: ICryptoService;

	beforeAll((): void => {
		cryptoService = new CryptoService();
	});

	describe('decryptText', (): void => {
		const ivLength: number = Number(process.env.CRYPTO_IV_LENGTH);
		const saltLength: number = Number(process.env.CRYPTO_SALT_LENGTH);
		const keyLength: number = Number(process.env.CRYPTO_KEY_LENGTH);
		const password: string = String(process.env.CRYPTO_PASSWORD);
		const algorithm: string = String(process.env.CRYPTO_CIPHER_ALGORITHM);
		const encryptionEncoding: string = String(process.env.CRYPTO_ENCRYPTION_ENCODING);

		it('should be defined', async (): Promise<void> => {
			expect(cryptoService.decryptText).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(cryptoService.decryptText).toBeInstanceOf(Function);
		});

		it('should properly decrypt text', async (): Promise<void> => {
			const initialText: string = 'Hello, world!';

			const iv: Buffer = crypto.randomBytes(ivLength);
			const salt: Buffer = crypto.randomBytes(saltLength);
			const key = (await promisify(crypto.scrypt)(password, salt, keyLength)) as Buffer;

			const cipher: crypto.Cipher = crypto.createCipheriv(algorithm, key, iv);
			const encryptedText = Buffer.concat([cipher.update(initialText, 'utf8'), cipher.final()]);

			const encryptedResult: string = Buffer.concat([salt, iv, encryptedText]).toString(
				encryptionEncoding as BufferEncoding,
			);

			const decryptedText: string = await cryptoService.decryptText(encryptedResult);

			expect(decryptedText).toBe(initialText);
		});
	});
});
