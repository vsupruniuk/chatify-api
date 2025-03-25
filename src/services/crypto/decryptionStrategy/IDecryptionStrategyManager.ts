export interface IDecryptionStrategyManager {
	/**
	 * Select decryption strategy based on data type and decrypt message
	 * @param data - data with encrypted message
	 * @returns data with decrypted message
	 */
	decrypt<T extends object>(data: T): Promise<T>;
}
