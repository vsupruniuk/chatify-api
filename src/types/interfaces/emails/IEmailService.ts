/**
 * Interface representing public method of email service
 */
export interface IEmailService {
	/**
	 * Send to user email with OPT code for account activation
	 * @param receiverEmail - user email for sending email
	 * @param OPTCode - generated OTP code
	 */
	sendActivationEmail(receiverEmail: string, OPTCode: number): Promise<void>;
}
