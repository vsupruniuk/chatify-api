/**
 * Service interface for actions related to text encryption and decryption
 */
export interface ICryptoService {
	/**
	 * Encrypt provided text with help of crypto library
	 * @param text - original text to encrypt
	 * @returns Promise<string> - encrypted text
	 */
	encryptText(text: string): Promise<string>;

	/**
	 * Decrypt provided text with help of crypto library
	 * @param encryptedText - text to decrypt
	 * @returns Promise<string> - original decrypted text
	 */
	decryptText(encryptedText: string): Promise<string>;
}
