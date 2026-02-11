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

	describe('Decrypt text', (): void => {
		const encryptedText: string = 'encryptedText';

		const saltMock: Buffer = Buffer.from('saltMock');
		const ivMock: Buffer = Buffer.from('ivMock');
		const encryptedTextContentMock: Buffer = Buffer.from('encryptedTextContentMock');
		const keyMock: Buffer = Buffer.from('keyMock');
		const decipherUpdateMock: Buffer = Buffer.from('cipherUpdateMock');
		const decipherFinalMock: Buffer = Buffer.from('cipherFinalMock');
		const decipherMock: crypto.Decipheriv = {
			update: jest.fn().mockReturnValue(decipherUpdateMock),
			final: jest.fn().mockReturnValue(decipherFinalMock),
		} as unknown as crypto.Decipheriv;

		const decryptedMessageMock: string = Buffer.concat([
			decipherUpdateMock,
			decipherFinalMock,
		]).toString('utf8');

		const bufferSubarrayMock = (startIndex: number) => {
			if (startIndex === 0) {
				return saltMock;
			}

			if (startIndex === Number(saltLengthMock)) {
				return ivMock;
			}

			return encryptedTextContentMock;
		};

		beforeEach((): void => {
			jest.spyOn(Buffer, 'from');
			jest
				.spyOn(Buffer.prototype, 'subarray')
				.mockImplementation(bufferSubarrayMock as (..._args: unknown[]) => unknown);
			jest.spyOn(crypto, 'scrypt').mockImplementation(() => keyMock);
			jest.spyOn(util, 'promisify').mockImplementation((fn) => fn);
			jest.spyOn(crypto, 'createDecipheriv').mockReturnValue(decipherMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should convert encrypted text to buffer', async (): Promise<void> => {
			await cryptoService.decryptText(encryptedText);

			expect(Buffer.from).toHaveBeenCalledTimes(1);
			expect(Buffer.from).toHaveBeenNthCalledWith(1, encryptedText, encryptionEncodingMock);
		});

		it('should extract salt from the encrypted buffer', async (): Promise<void> => {
			await cryptoService.decryptText(encryptedText);

			expect(Buffer.prototype.subarray).toHaveBeenCalledTimes(3);
			expect(Buffer.prototype.subarray).toHaveBeenNthCalledWith(1, 0, Number(saltLengthMock));
		});

		it('should extract iv from the encrypted buffer', async (): Promise<void> => {
			await cryptoService.decryptText(encryptedText);

			expect(Buffer.prototype.subarray).toHaveBeenCalledTimes(3);
			expect(Buffer.prototype.subarray).toHaveBeenNthCalledWith(
				2,
				Number(saltLengthMock),
				Number(saltLengthMock) + Number(ivLengthMock),
			);
		});

		it('should extract encrypted text content from the encrypted buffer', async (): Promise<void> => {
			await cryptoService.decryptText(encryptedText);

			expect(Buffer.prototype.subarray).toHaveBeenCalledTimes(3);
			expect(Buffer.prototype.subarray).toHaveBeenNthCalledWith(
				3,
				Number(saltLengthMock) + Number(ivLengthMock),
			);
		});

		it('should call scrypt method from crypto service to create a decryption key', async (): Promise<void> => {
			await cryptoService.decryptText(encryptedText);

			expect(crypto.scrypt).toHaveBeenCalledTimes(1);
			expect(crypto.scrypt).toHaveBeenNthCalledWith(
				1,
				passwordMock,
				saltMock,
				Number(keyLengthMock),
			);
		});

		it('should call create decipheriv method from crypto to create decipher instance', async (): Promise<void> => {
			await cryptoService.decryptText(encryptedText);

			expect(crypto.createDecipheriv).toHaveBeenCalledTimes(1);
			expect(crypto.createDecipheriv).toHaveBeenNthCalledWith(
				1,
				cipherAlgorithmMock,
				keyMock,
				ivMock,
			);
		});

		it('should use decipher to decrypt provided text', async (): Promise<void> => {
			await cryptoService.decryptText(encryptedText);

			expect(decipherMock.update).toHaveBeenCalledTimes(1);
			expect(decipherMock.update).toHaveBeenNthCalledWith(1, encryptedTextContentMock);

			expect(decipherMock.final).toHaveBeenCalledTimes(1);
		});

		it('should return properly decrypted message', async (): Promise<void> => {
			const decryptedMessage: string = await cryptoService.decryptText(encryptedText);

			expect(decryptedMessage).toBe(decryptedMessageMock);
		});
	});
});
