/**
 * Decryption strategy manager interface for decrypting different shape of messages data
 */
export interface IDecryptionStrategyManager {
	/**
	 * Decrypt message by a specific strategy, depends on data shape
	 * @param data - data where messages should be decrypted
	 * @returns Promise<T> - the same data with decrypted messages
	 * @throws InternalServerErrorException - if strategy managed does not have a strategy for provided data
	 * @template T - object of one of supported strategies
	 */
	decrypt<T extends object>(data: T): Promise<T>;
}
