import { accountActivationTemplate } from '@EmailTemplates/accountActivationTemplate';
import { resetPasswordTemplate } from '@EmailTemplates/resetPasswordTemplate';
import { EmailPriority } from '@Enums/EmailPriority.enum';

import { IEmailService } from '@Interfaces/emails/IEmailService';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements IEmailService {
	private readonly APP_NAME: string = 'Chatify';
	private readonly APP_EMAIL: string = process.env.SMTP_USER || '';
	private _transporter: Transporter;

	constructor() {
		this._transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST || '',
			port: Number(process.env.SMTP_PORT) || 465,
			secure: true,
			auth: {
				user: this.APP_EMAIL,
				pass: process.env.SMTP_PASS || '',
			},
		});

		this._transporter.verify((error: Error | null, success: true): void => {
			if (success) {
				console.log('Server is ready to take messages');
			} else {
				console.log(error);
			}
		});
	}

	public async sendActivationEmail(receiverEmail: string, otpCode: number): Promise<void> {
		const emailSubject: string = 'Chatify Account Activation';
		const emailContent: string = accountActivationTemplate(otpCode);

		return this._sendMail(
			receiverEmail,
			emailSubject,
			emailContent,
			emailContent,
			EmailPriority.HIGH,
		);
	}

	public async sendResetPasswordEmail(
		receiverEmail: string,
		userName: string,
		token: string,
	): Promise<void> {
		const emailSubject: string = 'Password reset';
		const link: string = `${process.env.CLIENT_URL || ''}/reset-password/${token}`;

		const emailContent: string = resetPasswordTemplate(userName, this.APP_EMAIL, link);

		return this._sendMail(
			receiverEmail,
			emailSubject,
			emailContent,
			emailContent,
			EmailPriority.HIGH,
		);
	}

	private async _sendMail(
		receiverEmail: string,
		emailSubject: string,
		emailText: string,
		emailHtml: string,
		emailPriority: EmailPriority = EmailPriority.NORMAL,
	): Promise<void> {
		await this._transporter.sendMail({
			from: { name: this.APP_NAME, address: this.APP_EMAIL },
			sender: { name: this.APP_NAME, address: this.APP_EMAIL },
			to: receiverEmail,
			subject: emailSubject,
			text: emailText,
			html: emailHtml,
			priority: emailPriority,
		});
	}
}
