/**
 * Decryption strategy interface that should be implemented by each specific strategy
 */
export interface IDecryptionStrategy<T> {
	/**
	 * Decrypts messages for specific shape of data
	 * @param data - data of specific shape with message to decrypt
	 * @returns Promist<T> - same data but with decrypted messages
	 * @template T - data shape for decryption
	 */
	decrypt(data: T): Promise<T>;
}
