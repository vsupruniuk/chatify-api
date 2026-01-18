import { Test, TestingModule } from '@nestjs/testing';

import * as crypto from 'node:crypto';
import * as util from 'node:util';

import { CryptoService } from '@services';

describe('Crypto service', (): void => {
	let cryptoService: CryptoService;

	const ivLengthMock: string = String(process.env.CRYPTO_IV_LENGTH);
	const saltLengthMock: string = String(process.env.CRYPTO_SALT_LENGTH);
	const keyLengthMock: string = String(process.env.CRYPTO_KEY_LENGTH);
	const passwordMock: string = String(process.env.CRYPTO_PASSWORD);
	const cipherAlgorithmMock: string = String(process.env.CRYPTO_CIPHER_ALGORITHM);
	const encryptionEncodingMock: string = String(process.env.CRYPTO_ENCRYPTION_ENCODING);

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [CryptoService],
		}).compile();

		cryptoService = moduleFixture.get(CryptoService);
	});

	describe('Encrypt text', (): void => {
		const bufferMock: Buffer = Buffer.from('bufferMock');
		const keyMock: Buffer = Buffer.from('keyMock');
		const cipherUpdateMock: Buffer = Buffer.from('cipherUpdateMock');
		const cipherFinalMock: Buffer = Buffer.from('cipherFinalMock');
		const cipherMock: crypto.Cipher = {
			update: jest.fn().mockReturnValue(cipherUpdateMock),
			final: jest.fn().mockReturnValue(cipherFinalMock),
		} as unknown as crypto.Cipher;

		const encryptedMessageMock: string = Buffer.concat([
			Buffer.from(bufferMock),
			Buffer.from(bufferMock),
			Buffer.concat([cipherUpdateMock, cipherFinalMock]),
		]).toString(encryptionEncodingMock as BufferEncoding);

		const text: string = 'Hello, Tony!';

		beforeEach((): void => {
			jest.spyOn(crypto, 'randomBytes').mockImplementation(() => bufferMock);
			jest.spyOn(crypto, 'scrypt').mockImplementation(() => keyMock);
			jest.spyOn(crypto, 'createCipheriv').mockReturnValue(cipherMock);
			jest.spyOn(util, 'promisify').mockImplementation((fn) => fn);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should call random bytes method from crypto to create initialization vector', async () => {
			await cryptoService.encryptText(text);

			expect(crypto.randomBytes).toHaveBeenCalledTimes(2);
			expect(crypto.randomBytes).toHaveBeenNthCalledWith(1, Number(ivLengthMock));
		});

		it('should call random bytes method from crypto to create salt', async () => {
			await cryptoService.encryptText(text);

			expect(crypto.randomBytes).toHaveBeenCalledTimes(2);
			expect(crypto.randomBytes).toHaveBeenNthCalledWith(2, Number(saltLengthMock));
		});

		it('should call scrypt method from crypto to generate key foк cipher', async (): Promise<void> => {
			await cryptoService.encryptText(text);

			expect(crypto.scrypt).toHaveBeenCalledTimes(1);
			expect(crypto.scrypt).toHaveBeenNthCalledWith(
				1,
				passwordMock,
				bufferMock,
				Number(keyLengthMock),
			);
		});

		it('should call create cipheriv method from crypto to create a cipher instance', async (): Promise<void> => {
			await cryptoService.encryptText(text);

			expect(crypto.createCipheriv).toHaveBeenCalledTimes(1);
			expect(crypto.createCipheriv).toHaveBeenNthCalledWith(
				1,
				cipherAlgorithmMock,
				keyMock,
				bufferMock,
			);
		});

		it('should use cipher to encrypt provided text', async (): Promise<void> => {
			await cryptoService.encryptText(text);

			expect(cipherMock.update).toHaveBeenCalledTimes(1);
			expect(cipherMock.update).toHaveBeenNthCalledWith(1, text, 'utf8');

			expect(cipherMock.final).toHaveBeenCalledTimes(1);
		});

		it('should return properly encrypted message', async (): Promise<void> => {
			const encryptedMessage: string = await cryptoService.encryptText(text);

			expect(encryptedMessage).toBe(encryptedMessageMock);
		});
	});
});
