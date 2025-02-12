/**
 * Interface representing public method of email service
 */
export interface IEmailService {
	/**
	 * Send to user email with OTP code for account activation
	 * @param receiverEmail - user email for sending email
	 * @param otpCode - generated OTP code
	 */
	sendActivationEmail(receiverEmail: string, otpCode: number): Promise<void>;
	//
	// /**
	//  * Send to user email with link for reset password
	//  * @param receiverEmail - email entered on registration
	//  * @param userName - name entered on registration
	//  * @param token - uuid token generated for this user
	//  */
	// sendResetPasswordEmail(receiverEmail: string, userName: string, token: string): Promise<void>;
}
