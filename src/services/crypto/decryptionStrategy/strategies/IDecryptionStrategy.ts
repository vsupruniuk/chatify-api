export interface IDecryptionStrategy<T> {
	/**
	 * Decrypt messaged for a specific DTO
	 * @param data - data with encrypted message
	 * @returns data with decrypted message
	 */
	decrypt(data: T): Promise<T>;
}
