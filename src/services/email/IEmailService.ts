/**
 * Service interface for actions with emails
 */
export interface IEmailService {
	/**
	 * Send email to the user with account activation information
	 * @param receiverEmail - email of the user to send email
	 * @param otpCode - OTP code for account activation
	 */
	sendActivationEmail(receiverEmail: string, otpCode: number): Promise<void>;

	/**
	 * Send email to the user with password reset information
	 * @param receiverEmail - email of the user to send email
	 * @param userName - name of the user
	 * @param token - password reset token
	 */
	sendResetPasswordEmail(receiverEmail: string, userName: string, token: string): Promise<void>;
}
