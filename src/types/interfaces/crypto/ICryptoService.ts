export interface ICryptoService {
	encryptText(text: string): Promise<string>;

	decryptText(encryptedText: string): Promise<string>;
}
