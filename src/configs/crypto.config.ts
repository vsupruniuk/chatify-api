export const cryptoConfig = {
	ivLength: Number(process.env.CRYPTO_IV_LENGTH),
	saltLength: Number(process.env.CRYPTO_SALT_LENGTH),
	keyLength: Number(process.env.CRYPTO_KEY_LENGTH),
	password: String(process.env.CRYPTO_PASSWORD),
	algorithm: String(process.env.CRYPTO_CIPHER_ALGORITHM),
	encryptionEncoding: String(process.env.CRYPTO_ENCRYPTION_ENCODING),
} as const;
